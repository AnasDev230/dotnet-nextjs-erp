using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Finance;
using Server.Features.Finance.Enums;
using Server.Features.Finance.Repositories;
using Server.Features.Inventory;
using Server.Features.Inventory.Repositories;
using Server.Features.Sales.Entities;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Features.Sales.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Services;

public class SalesReturnService : ISalesReturnService
{
    private const string SalesMovementType = "Sale";
    private const string SalesReturnReferenceType = "SalesReturn";

    private readonly ISalesReturnRepository _repository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SalesReturnService(
        ISalesReturnRepository repository,
        IInvoiceRepository invoiceRepository,
        IWarehouseRepository warehouseRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _invoiceRepository = invoiceRepository;
        _warehouseRepository = warehouseRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<SalesReturnListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, ReturnStatus? status,
        DateTime? fromDate, DateTime? toDate)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, customerId, status, fromDate, toDate);

    public async Task<SalesReturnResponse> GetByIdAsync(Guid id)
    {
        var salesReturn = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(SalesReturn), id);
        return salesReturn;
    }

    public async Task<SalesReturnResponse> CreateAsync(CreateSalesReturnRequest request)
    {
        // 1. Validate invoice exists and is Issued/PartiallyPaid/Paid
        var invoice = await _invoiceRepository.GetByIdAsync(request.InvoiceId)
            ?? throw new NotFoundException(nameof(Invoice), request.InvoiceId);

        if (invoice.Status is not (InvoiceStatus.Issued or InvoiceStatus.PartiallyPaid or InvoiceStatus.Paid))
            throw new BusinessException("لا يمكن إنشاء مرتجع على فاتورة غير صادرة");

        // 2. Validate customer matches invoice
        if (invoice.CustomerId != request.CustomerId)
            throw new BusinessException("العميل لا يطابق عميل الفاتورة");

        // 3. Validate warehouse exists and is active
        var warehouse = await _warehouseRepository.GetEntityByIdAsync(request.WarehouseId)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        if (!warehouse.IsActive)
            throw new BusinessException("لا يمكن إرجاع البضاعة إلى مستودع غير نشط");

        // 4. Validate items against the original sales order
        if (request.Items is null || request.Items.Count == 0)
            throw new BusinessException("يجب إضافة صنف مرتجع واحد على الأقل");

        var orderItems = await _repository.GetOriginalOrderItemsAsync(invoice.OrderId);
        var returnedPerProduct = await _repository.GetReturnedQuantitiesAsync(request.InvoiceId);

        var totalAmount = 0m;
        foreach (var item in request.Items)
        {
            var original = orderItems.FirstOrDefault(i => i.ProductId == item.ProductId)
                ?? throw new BusinessException("أحد أصناف المرتجع غير موجود في الفاتورة الأصلية");

            if (item.Quantity <= 0)
                throw new BusinessException("الكمية المرتجعة يجب أن تكون أكبر من صفر");

            var remaining = original.Quantity - returnedPerProduct.GetValueOrDefault(item.ProductId);
            if (item.Quantity > remaining)
                throw new BusinessException($"الكمية المرتجعة تتجاوز الكمية المتبقية ({remaining})");

            totalAmount += item.Quantity * item.UnitPrice;
        }

        // 5. Generate return number: SRET-YYYY-XXXX
        var returnNumber = await _repository.GenerateReturnNumberAsync();

        // 6. Persist as Draft
        var salesReturn = new SalesReturn
        {
            ReturnNumber = returnNumber,
            InvoiceId = request.InvoiceId,
            CustomerId = request.CustomerId,
            WarehouseId = request.WarehouseId,
            Reason = request.Reason,
            ReturnDate = request.ReturnDate,
            TotalAmount = totalAmount,
            Status = ReturnStatus.Draft,
            CreatedBy = _currentUserService.UserId,
            Items = request.Items.Select(i => new SalesReturnItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.Quantity * i.UnitPrice,
                Reason = i.Reason,
                CreatedBy = _currentUserService.UserId
            }).ToList()
        };

        await _repository.AddAsync(salesReturn);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(salesReturn.Id);
    }

    public async Task SubmitAsync(Guid id)
    {
        var salesReturn = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(SalesReturn), id);

        if (salesReturn.Status != ReturnStatus.Draft)
            throw new BusinessException("لا يمكن إرسال المرتجع إلا من حالة المسودة");

        salesReturn.Status = ReturnStatus.Submitted;
        salesReturn.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task ApproveAsync(Guid id)
    {
        var salesReturn = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(SalesReturn), id);

        if (salesReturn.Status != ReturnStatus.Submitted)
            throw new BusinessException("لا يمكن اعتماد المرتجع إلا من حالة الإرسال");

        salesReturn.Status = ReturnStatus.Approved;
        salesReturn.ApprovedBy = _currentUserService.UserId;
        salesReturn.ApprovedAt = DateTime.UtcNow;
        salesReturn.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task CompleteAsync(Guid id)
    {
        var salesReturn = await _repository.GetEntityWithItemsByIdAsync(id)
            ?? throw new NotFoundException(nameof(SalesReturn), id);

        if (salesReturn.Status != ReturnStatus.Approved)
            throw new BusinessException("لا يمكن إكمال المرتجع إلا من حالة الاعتماد");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in salesReturn.Items)
            {
                // 1. Increase stock in the return warehouse
                var level = await _context.InventoryLevels
                    .FirstOrDefaultAsync(l => l.ProductId == item.ProductId && l.WarehouseId == salesReturn.WarehouseId);

                if (level is null)
                {
                    _context.InventoryLevels.Add(new InventoryLevel
                    {
                        ProductId = item.ProductId,
                        WarehouseId = salesReturn.WarehouseId,
                        QuantityOnHand = item.Quantity,
                        LastMovement = DateTime.UtcNow,
                        CreatedBy = _currentUserService.UserId
                    });
                }
                else
                {
                    level.QuantityOnHand += item.Quantity;
                    level.LastMovement = DateTime.UtcNow;
                    level.UpdatedBy = _currentUserService.UserId;
                }

                // 2. Stock movement audit record
                _context.StockMovements.Add(new StockMovement
                {
                    MovementType = SalesMovementType,
                    ReferenceType = SalesReturnReferenceType,
                    ReferenceId = salesReturn.Id,
                    ProductId = item.ProductId,
                    WarehouseId = salesReturn.WarehouseId,
                    Quantity = item.Quantity,
                    MovementDate = DateTime.UtcNow,
                    Notes = $"Sales return {salesReturn.ReturnNumber}",
                    CreatedBy = _currentUserService.UserId
                });
            }

            // 3. Mark as completed
            salesReturn.Status = ReturnStatus.Completed;
            salesReturn.CompletedAt = DateTime.UtcNow;
            salesReturn.UpdatedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task CancelAsync(Guid id)
    {
        var salesReturn = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(SalesReturn), id);

        if (salesReturn.Status is not (ReturnStatus.Draft or ReturnStatus.Submitted))
            throw new BusinessException("لا يمكن إلغاء المرتجع في حالته الحالية");

        salesReturn.Status = ReturnStatus.Cancelled;
        salesReturn.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var salesReturn = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(SalesReturn), id);

        if (salesReturn.Status != ReturnStatus.Draft)
            throw new BusinessException("لا يمكن حذف المرتجع إلا في حالة المسودة");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }
}