using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory;
using Server.Features.Inventory.Repositories;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;
using Server.Features.Sales.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Services;

public class PurchaseReturnService : IPurchaseReturnService
{
    private const string PurchaseMovementType = "Purchase";
    private const string PurchaseReturnReferenceType = "PurchaseReturn";

    private readonly IPurchaseReturnRepository _repository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public PurchaseReturnService(
        IPurchaseReturnRepository repository,
        IWarehouseRepository warehouseRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _warehouseRepository = warehouseRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<PurchaseReturnListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? supplierId, ReturnStatus? status,
        DateTime? fromDate, DateTime? toDate)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, supplierId, status, fromDate, toDate);

    public async Task<PurchaseReturnResponse> GetByIdAsync(Guid id)
    {
        var purchaseReturn = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseReturn), id);
        return purchaseReturn;
    }

    public async Task<PurchaseReturnResponse> CreateAsync(CreatePurchaseReturnRequest request)
    {
        // 1. Validate goods receipt exists and is not cancelled
        var grn = await _repository.GetGrnWithItemsAsync(request.GoodsReceiptId)
            ?? throw new NotFoundException(nameof(GoodsReceipt), request.GoodsReceiptId);

        if (grn.Status == GoodsReceiptStatus.Cancelled)
            throw new BusinessException("لا يمكن إنشاء مرتجع على استلام ملغي");

        // 2. Validate supplier matches GRN's PO supplier
        if (grn.PurchaseOrder.SupplierId != request.SupplierId)
            throw new BusinessException("المورد لا يطابق مورد أمر الشراء المرتبط بالاستلام");

        // 3. Validate warehouse exists and is active
        var warehouse = await _warehouseRepository.GetEntityByIdAsync(request.WarehouseId)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        if (!warehouse.IsActive)
            throw new BusinessException("لا يمكن إرجاع بضاعة من مستودع غير نشط");

        // 4. Validate items against the received quantities in the GRN
        if (request.Items is null || request.Items.Count == 0)
            throw new BusinessException("يجب إضافة صنف مرتجع واحد على الأقل");

        var returnedPerProduct = await _repository.GetReturnedQuantitiesAsync(request.GoodsReceiptId);

        var totalAmount = 0m;
        foreach (var item in request.Items)
        {
            var received = grn.Items.Where(i => i.ProductId == item.ProductId).Sum(i => i.Quantity);
            if (received <= 0)
                throw new BusinessException("أحد أصناف المرتجع غير موجود في الاستلام");

            if (item.Quantity <= 0)
                throw new BusinessException("الكمية المرتجعة يجب أن تكون أكبر من صفر");

            var remaining = received - returnedPerProduct.GetValueOrDefault(item.ProductId);
            if (item.Quantity > remaining)
                throw new BusinessException($"الكمية المرتجعة تتجاوز الكمية المتبقية ({remaining})");

            totalAmount += item.Quantity * item.UnitCost;
        }

        // 5. Generate return number: PRET-YYYY-XXXX
        var returnNumber = await _repository.GenerateReturnNumberAsync();

        // 6. Persist as Draft
        var purchaseReturn = new PurchaseReturn
        {
            ReturnNumber = returnNumber,
            GoodsReceiptId = request.GoodsReceiptId,
            SupplierId = request.SupplierId,
            WarehouseId = request.WarehouseId,
            Reason = request.Reason,
            ReturnDate = request.ReturnDate,
            TotalAmount = totalAmount,
            Status = ReturnStatus.Draft,
            CreatedBy = _currentUserService.UserId,
            Items = request.Items.Select(i => new PurchaseReturnItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitCost = i.UnitCost,
                LineTotal = i.Quantity * i.UnitCost,
                Reason = i.Reason,
                CreatedBy = _currentUserService.UserId
            }).ToList()
        };

        await _repository.AddAsync(purchaseReturn);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(purchaseReturn.Id);
    }

    public async Task SubmitAsync(Guid id)
    {
        var purchaseReturn = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseReturn), id);

        if (purchaseReturn.Status != ReturnStatus.Draft)
            throw new BusinessException("لا يمكن إرسال المرتجع إلا من حالة المسودة");

        purchaseReturn.Status = ReturnStatus.Submitted;
        purchaseReturn.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task ApproveAsync(Guid id)
    {
        var purchaseReturn = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseReturn), id);

        if (purchaseReturn.Status != ReturnStatus.Submitted)
            throw new BusinessException("لا يمكن اعتماد المرتجع إلا من حالة الإرسال");

        purchaseReturn.Status = ReturnStatus.Approved;
        purchaseReturn.ApprovedBy = _currentUserService.UserId;
        purchaseReturn.ApprovedAt = DateTime.UtcNow;
        purchaseReturn.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task CompleteAsync(Guid id)
    {
        var purchaseReturn = await _repository.GetEntityWithItemsByIdAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseReturn), id);

        if (purchaseReturn.Status != ReturnStatus.Approved)
            throw new BusinessException("لا يمكن إكمال المرتجع إلا من حالة الاعتماد");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in purchaseReturn.Items)
            {
                // 1. Validate sufficient stock, then decrease
                var level = await _context.InventoryLevels
                    .FirstOrDefaultAsync(l => l.ProductId == item.ProductId && l.WarehouseId == purchaseReturn.WarehouseId);

                var available = level?.QuantityOnHand ?? 0;
                if (available < item.Quantity)
                    throw new BusinessException(
                        $"الكمية غير متوفرة في المستودع لمرتجع المنتج. المتاح: {available}");

                level!.QuantityOnHand -= item.Quantity;
                level.LastMovement = DateTime.UtcNow;
                level.UpdatedBy = _currentUserService.UserId;

                // 2. Stock movement audit record
                _context.StockMovements.Add(new StockMovement
                {
                    MovementType = PurchaseMovementType,
                    ReferenceType = PurchaseReturnReferenceType,
                    ReferenceId = purchaseReturn.Id,
                    ProductId = item.ProductId,
                    WarehouseId = purchaseReturn.WarehouseId,
                    Quantity = -item.Quantity,
                    UnitCost = item.UnitCost,
                    TotalCost = item.Quantity * item.UnitCost,
                    MovementDate = DateTime.UtcNow,
                    Notes = $"Purchase return {purchaseReturn.ReturnNumber}",
                    CreatedBy = _currentUserService.UserId
                });
            }

            // 3. Mark as completed
            purchaseReturn.Status = ReturnStatus.Completed;
            purchaseReturn.CompletedAt = DateTime.UtcNow;
            purchaseReturn.UpdatedBy = _currentUserService.UserId;

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
        var purchaseReturn = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseReturn), id);

        if (purchaseReturn.Status is not (ReturnStatus.Draft or ReturnStatus.Submitted))
            throw new BusinessException("لا يمكن إلغاء المرتجع في حالته الحالية");

        purchaseReturn.Status = ReturnStatus.Cancelled;
        purchaseReturn.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var purchaseReturn = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseReturn), id);

        if (purchaseReturn.Status != ReturnStatus.Draft)
            throw new BusinessException("لا يمكن حذف المرتجع إلا في حالة المسودة");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }
}