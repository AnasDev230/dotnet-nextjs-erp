using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory;
using Server.Features.Inventory.Repositories;
using Server.Features.Sales.Models;
using Server.Features.Sales.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Services;

public class SalesOrderService : ISalesOrderService
{
    private readonly ISalesOrderRepository _repository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IProductRepository _productRepository;
    private readonly IInventoryLevelRepository _inventoryLevelRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SalesOrderService(
        ISalesOrderRepository repository,
        ICustomerRepository customerRepository,
        IProductRepository productRepository,
        IInventoryLevelRepository inventoryLevelRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _customerRepository = customerRepository;
        _productRepository = productRepository;
        _inventoryLevelRepository = inventoryLevelRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<SalesOrderListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, SalesOrderStatus? status,
        DateOnly? fromDate, DateOnly? toDate)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, customerId, status, fromDate, toDate);

    public async Task<SalesOrderResponse> GetByIdAsync(Guid id)
    {
        var order = await _repository.GetByIdAsync(id);
        if (order is null) throw new NotFoundException(nameof(SalesOrder), id);
        return order;
    }

    public async Task<SalesOrderResponse> CreateAsync(CreateSalesOrderRequest request)
    {
        // 1. Generate order number (SO-YYYY-XXXX)
        var orderNumber = await _repository.GenerateOrderNumberAsync();

        // 2. Validate customer exists and is active
        var customer = await _customerRepository.GetEntityByIdAsync(request.CustomerId)
            ?? throw new NotFoundException(nameof(Customer), request.CustomerId);

        if (customer.Status != CustomerStatus.Active)
            throw new BusinessException("لا يمكن إنشاء أمر بيع لعميل موقوف");

        // 3 + 4. Validate products and check availability (READ-ONLY, no reservation in Phase 1)
        await EnsureAvailabilityAsync(request.Items);

        // 5. Create SalesOrder entity
        var order = new SalesOrder
        {
            OrderNumber = orderNumber,
            CustomerId = request.CustomerId,
            OrderDate = request.OrderDate,
            DeliveryDate = request.DeliveryDate,
            Notes = request.Notes,
            Status = SalesOrderStatus.Draft,
            CreatedBy = _currentUserService.UserId,
            Items = new List<SalesOrderItem>()
        };

        // 6. Create SalesOrderItem entities and calculate LineTotal
        foreach (var item in request.Items)
        {
            order.Items.Add(new SalesOrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.Quantity * item.UnitPrice,
                CreatedBy = _currentUserService.UserId
            });
        }

        // 7. Calculate TotalAmount
        order.TotalAmount = order.Items.Sum(i => i.LineTotal);

        // 8 + 9. Save (single aggregate — no transaction needed)
        await _repository.AddAsync(order);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(order.Id);
    }

    public async Task<SalesOrderResponse> UpdateAsync(Guid id, UpdateSalesOrderRequest request)
    {
        var order = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new NotFoundException(nameof(SalesOrder), id);

        // Only Draft orders are editable
        if (order.Status != SalesOrderStatus.Draft)
            throw new BusinessException("لا يمكن تعديل أمر البيع بعد تأكيده أو إلغائه");

        var customer = await _customerRepository.GetEntityByIdAsync(request.CustomerId)
            ?? throw new NotFoundException(nameof(Customer), request.CustomerId);

        if (customer.Status != CustomerStatus.Active)
            throw new BusinessException("لا يمكن تعديل أمر البيع لعميل موقوف");

        await EnsureAvailabilityAsync(request.Items);

        // Update master fields
        order.CustomerId = request.CustomerId;
        order.OrderDate = request.OrderDate;
        order.DeliveryDate = request.DeliveryDate;
        order.Status = request.Status;
        order.Notes = request.Notes;
        order.UpdatedBy = _currentUserService.UserId;

        // Replace items strategy: remove existing, add new
        foreach (var existing in order.Items.ToList())
            order.Items.Remove(existing);

        foreach (var item in request.Items)
        {
            order.Items.Add(new SalesOrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.Quantity * item.UnitPrice,
                CreatedBy = _currentUserService.UserId
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.LineTotal);

        await _repository.UpdateAsync(order);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var order = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new NotFoundException(nameof(SalesOrder), id);

        // Only Draft orders can be deleted
        if (order.Status != SalesOrderStatus.Draft)
            throw new BusinessException("لا يمكن حذف أمر البيع بعد تأكيده أو إلغائه");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Phase 1: READ-ONLY availability check. Inventory is NOT reserved here —
    /// reservation will be added in Phase 3.
    /// </summary>
    private async Task EnsureAvailabilityAsync(List<SalesOrderItemRequest> items)
    {
        foreach (var item in items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product is null)
                throw new NotFoundException(nameof(Product), item.ProductId);

            if (!product.IsActive)
                throw new BusinessException($"المنتج '{product.Name}' غير نشط");

            // Get first warehouse that has this product (simplest logic for Phase 1)
            var level = await _inventoryLevelRepository.FindByProductIdAsync(item.ProductId);
            if (level is null || level.QuantityAvailable < item.Quantity)
            {
                throw new BusinessException(
                    $"الكمية المطلوبة من المنتج '{product.Name}' غير متوفرة. " +
                    $"المتاح: {level?.QuantityAvailable ?? 0}");
            }
        }
    }
}
