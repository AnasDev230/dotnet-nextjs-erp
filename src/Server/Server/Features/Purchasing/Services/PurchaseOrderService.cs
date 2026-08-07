using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory;
using Server.Features.Inventory.Repositories;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Services;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly IPurchaseOrderRepository _repository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly IProductRepository _productRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public PurchaseOrderService(
        IPurchaseOrderRepository repository,
        ISupplierRepository supplierRepository,
        IProductRepository productRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _supplierRepository = supplierRepository;
        _productRepository = productRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<PurchaseOrderListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? supplierId, PurchaseOrderStatus? status,
        DateOnly? fromDate, DateOnly? toDate)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, supplierId, status, fromDate, toDate);

    public async Task<PurchaseOrderResponse> GetByIdAsync(Guid id)
    {
        var order = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseOrder), id);
        return order;
    }

    public async Task<PurchaseOrderResponse> CreateAsync(CreatePurchaseOrderRequest request)
    {
        var poNumber = await _repository.GeneratePoNumberAsync();

        var supplier = await _supplierRepository.GetEntityByIdAsync(request.SupplierId)
            ?? throw new NotFoundException(nameof(Supplier), request.SupplierId);

        if (supplier.Status != SupplierStatus.Active)
            throw new BusinessException("لا يمكن إنشاء أمر شراء لمورد موقوف");

        await EnsureProductsValidAsync(request.Items);

        // Create order + items within a single transaction
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = new PurchaseOrder
            {
                PoNumber = poNumber,
                SupplierId = request.SupplierId,
                OrderDate = request.OrderDate,
                ExpectedDate = request.ExpectedDate,
                Currency = request.Currency,
                Terms = request.Terms,
                Status = PurchaseOrderStatus.Draft,
                CreatedBy = _currentUserService.UserId,
                Items = new List<PoItem>()
            };

            foreach (var item in request.Items)
            {
                var lineTotal = item.Quantity * item.UnitPrice;
                order.Items.Add(new PoItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    LineTotal = lineTotal,
                    CreatedBy = _currentUserService.UserId
                });
            }

            order.TotalAmount = order.Items.Sum(i => i.LineTotal);

            await _repository.AddAsync(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return await GetByIdAsync(order.Id);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PurchaseOrderResponse> UpdateAsync(Guid id, UpdatePurchaseOrderRequest request)
    {
        var order = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseOrder), id);

        if (order.Status != PurchaseOrderStatus.Draft)
            throw new BusinessException("لا يمكن تعديل أمر الشراء إلا في حالة المسودة");

        var supplier = await _supplierRepository.GetEntityByIdAsync(request.SupplierId)
            ?? throw new NotFoundException(nameof(Supplier), request.SupplierId);

        if (supplier.Status != SupplierStatus.Active)
            throw new BusinessException("لا يمكن تعديل أمر الشراء لمورد موقوف");

        await EnsureProductsValidAsync(request.Items);

        order.SupplierId = request.SupplierId;
        order.OrderDate = request.OrderDate;
        order.ExpectedDate = request.ExpectedDate;
        order.Currency = request.Currency;
        order.Terms = request.Terms;
        order.UpdatedBy = _currentUserService.UserId;

        // Replace items entirely (only Draft POs, no receipts yet)
        foreach (var existing in order.Items.ToList())
            order.Items.Remove(existing);

        foreach (var item in request.Items)
        {
            order.Items.Add(new PoItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.Quantity * item.UnitPrice,
                CreatedBy = _currentUserService.UserId
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.LineTotal);

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return await GetByIdAsync(id);
    }

    public async Task SubmitAsync(Guid id)
    {
        var order = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseOrder), id);

        if (order.Status != PurchaseOrderStatus.Draft)
            throw new BusinessException("لا يمكن إرسال أمر الشراء إلا من حالة المسودة");

        order.Status = PurchaseOrderStatus.Submitted;
        order.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task ApproveAsync(Guid id)
    {
        var order = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseOrder), id);

        if (order.Status != PurchaseOrderStatus.Submitted)
            throw new BusinessException("لا يمكن اعتماد أمر الشراء إلا من حالة الإرسال");

        order.Status = PurchaseOrderStatus.Approved;
        order.ApprovedBy = _currentUserService.UserId;
        order.ApprovedAt = DateTime.UtcNow;
        order.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task CancelAsync(Guid id)
    {
        var order = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseOrder), id);

        if (order.Status is not (PurchaseOrderStatus.Draft
            or PurchaseOrderStatus.Submitted
            or PurchaseOrderStatus.Approved))
            throw new BusinessException("لا يمكن إلغاء أمر الشراء في حالته الحالية");

        var hasReceipts = await _context.GoodsReceipts.AnyAsync(gr => gr.PurchaseOrderId == id);
        if (hasReceipts)
            throw new BusinessException("لا يمكن إلغاء أمر شراء تم استلام جزء منه أو كله");

        order.Status = PurchaseOrderStatus.Cancelled;
        order.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var order = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new NotFoundException(nameof(PurchaseOrder), id);

        if (order.Status != PurchaseOrderStatus.Draft)
            throw new BusinessException("لا يمكن حذف أمر الشراء إلا في حالة المسودة");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureProductsValidAsync(List<PoItemRequest> items)
    {
        foreach (var item in items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product is null)
                throw new NotFoundException(nameof(Product), item.ProductId);

            if (!product.IsActive)
                throw new BusinessException($"المنتج '{product.Name}' غير نشط");

            if (item.Quantity <= 0)
                throw new BusinessException($"كمية المنتج '{product.Name}' يجب أن تكون أكبر من صفر");

            if (item.UnitPrice <= 0)
                throw new BusinessException($"سعر المنتج '{product.Name}' يجب أن يكون أكبر من صفر");
        }
    }
}
