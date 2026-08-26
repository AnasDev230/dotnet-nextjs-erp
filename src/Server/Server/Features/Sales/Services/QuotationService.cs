using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory;
using Server.Features.Inventory.Repositories;
using Server.Features.Sales.Entities;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Features.Sales.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Services;

public class QuotationService : IQuotationService
{
    private readonly IQuotationRepository _repository;
    private readonly ISalesOrderRepository _salesOrderRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IProductRepository _productRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public QuotationService(
        IQuotationRepository repository,
        ISalesOrderRepository salesOrderRepository,
        ICustomerRepository customerRepository,
        IProductRepository productRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _salesOrderRepository = salesOrderRepository;
        _customerRepository = customerRepository;
        _productRepository = productRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<QuotationListItemResponse>> GetAllAsync(
        int page, int pageSize, QuotationStatus? status = null, Guid? customerId = null)
    {
        await _repository.MarkExpiredAsync();
        return await _repository.GetAllAsync(page, pageSize, status, customerId);
    }

    public async Task<QuotationResponse> GetByIdAsync(Guid id)
    {
        var quotation = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Quotation), id);
        return MapToResponse(quotation);
    }

    public async Task<QuotationResponse> CreateAsync(CreateQuotationRequest request)
    {
        var customer = await _customerRepository.GetEntityByIdAsync(request.CustomerId)
            ?? throw new NotFoundException(nameof(Customer), request.CustomerId);

        if (customer.Status != CustomerStatus.Active)
            throw new BusinessException("لا يمكن إنشاء عرض سعر لعميل موقوف");

        if (request.ExpiryDate <= request.QuotationDate)
            throw new BusinessException("تاريخ الانتهاء يجب أن يكون بعد تاريخ العرض");

        if (request.Items is null || request.Items.Count == 0)
            throw new BusinessException("يجب إضافة صنف واحد على الأقل");

        await ValidateItemsAsync(request.Items);

        var quotation = new Quotation
        {
            QuotationNumber = await _repository.GenerateQuotationNumberAsync(),
            CustomerId = request.CustomerId,
            QuotationDate = request.QuotationDate,
            ExpiryDate = request.ExpiryDate,
            DiscountAmount = request.DiscountAmount,
            TaxAmount = request.TaxAmount,
            Notes = request.Notes,
            Status = QuotationStatus.Draft,
            CreatedBy = _currentUserService.UserId
        };

        foreach (var item in request.Items)
        {
            quotation.Items.Add(new QuotationItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                DiscountPercent = item.DiscountPercent,
                CreatedBy = _currentUserService.UserId
            });
        }

        CalculateAmounts(quotation);

        await _repository.AddAsync(quotation);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(quotation.Id);
    }

    public async Task<QuotationResponse> UpdateAsync(Guid id, UpdateQuotationRequest request)
    {
        var quotation = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Quotation), id);

        if (quotation.Status != QuotationStatus.Draft)
            throw new BusinessException("لا يمكن تعديل عرض السعر بعد إرساله");

        if (request.ExpiryDate <= request.QuotationDate)
            throw new BusinessException("تاريخ الانتهاء يجب أن يكون بعد تاريخ العرض");

        if (request.Items is null || request.Items.Count == 0)
            throw new BusinessException("يجب إضافة صنف واحد على الأقل");

        await ValidateItemsAsync(request.Items);

        quotation.QuotationDate = request.QuotationDate;
        quotation.ExpiryDate = request.ExpiryDate;
        quotation.DiscountAmount = request.DiscountAmount;
        quotation.TaxAmount = request.TaxAmount;
        quotation.Notes = request.Notes;
        quotation.UpdatedBy = _currentUserService.UserId;

        foreach (var existing in quotation.Items.ToList())
            quotation.Items.Remove(existing);

        foreach (var item in request.Items)
        {
            quotation.Items.Add(new QuotationItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                DiscountPercent = item.DiscountPercent,
                CreatedBy = _currentUserService.UserId
            });
        }

        CalculateAmounts(quotation);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task SendAsync(Guid id)
    {
        var quotation = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Quotation), id);

        if (quotation.Status != QuotationStatus.Draft)
            throw new BusinessException("لا يمكن إرسال العرض إلا من حالة المسودة");

        quotation.Status = QuotationStatus.Sent;
        quotation.SentBy = _currentUserService.UserId;
        quotation.SentAt = DateTime.UtcNow;
        quotation.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task AcceptAsync(Guid id)
    {
        var quotation = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Quotation), id);

        if (quotation.Status != QuotationStatus.Sent)
            throw new BusinessException("لا يمكن قبول العرض إلا في حالة مُرسل");

        if (quotation.ExpiryDate.Date < DateTime.UtcNow.Date)
            throw new BusinessException("انتهت صلاحية هذا العرض ولا يمكن قبوله");

        quotation.Status = QuotationStatus.Accepted;
        quotation.RespondedBy = _currentUserService.UserId;
        quotation.RespondedAt = DateTime.UtcNow;
        quotation.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task RejectAsync(Guid id)
    {
        var quotation = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Quotation), id);

        if (quotation.Status != QuotationStatus.Sent)
            throw new BusinessException("لا يمكن رفض العرض إلا في حالة مُرسل");

        quotation.Status = QuotationStatus.Rejected;
        quotation.RespondedBy = _currentUserService.UserId;
        quotation.RespondedAt = DateTime.UtcNow;
        quotation.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task CancelAsync(Guid id)
    {
        var quotation = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Quotation), id);

        if (quotation.Status is not (QuotationStatus.Draft or QuotationStatus.Sent))
            throw new BusinessException("لا يمكن إلغاء العرض في حالته الحالية");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var quotation = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Quotation), id);

        if (quotation.Status != QuotationStatus.Draft)
            throw new BusinessException("لا يمكن حذف العرض إلا من حالة المسودة");

        await _repository.HardDeleteAsync(id);
        await _context.SaveChangesAsync();
    }

    public async Task<Guid> ConvertToSalesOrderAsync(Guid id, Guid? warehouseId = null)
    {
        var quotation = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Quotation), id);

        if (quotation.Status != QuotationStatus.Accepted)
            throw new BusinessException("لا يمكن تحويل العرض إلا من حالة مقبول");

        if (quotation.ConvertedSalesOrderId.HasValue)
            throw new BusinessException("تم تحويل هذا العرض مسبقاً");

        if (quotation.ExpiryDate.Date < DateTime.UtcNow.Date)
            throw new BusinessException("انتهت صلاحية هذا العرض ولا يمكن تحويله");

        var targetWarehouseId = warehouseId
            ?? await _context.Warehouses
                .Where(w => w.IsActive)
                .OrderBy(w => w.CreatedAt)
                .Select(w => (Guid?)w.Id)
                .FirstOrDefaultAsync()
            ?? throw new BusinessException("لا يوجد مستودع نشط لإنشاء أمر البيع. حدد المستودع");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var orderNumber = await _salesOrderRepository.GenerateOrderNumberAsync();

            var salesOrder = BuildSalesOrderFromQuotation(quotation, targetWarehouseId, orderNumber);

            await _salesOrderRepository.AddAsync(salesOrder);

            quotation.Status = QuotationStatus.Converted;
            quotation.ConvertedSalesOrderId = salesOrder.Id;
            quotation.UpdatedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return salesOrder.Id;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task ValidateItemsAsync(List<QuotationItemRequest> items)
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

            if (item.DiscountPercent is < 0 or > 100)
                throw new BusinessException($"نسبة خصم المنتج '{product.Name}' يجب أن تكون بين 0 و 100");
        }
    }

    private static void CalculateAmounts(Quotation quotation)
    {
        foreach (var item in quotation.Items)
        {
            var lineGross = item.Quantity * item.UnitPrice;
            var lineDiscount = lineGross * (item.DiscountPercent / 100m);
            item.LineTotal = Math.Round(lineGross - lineDiscount, 2, MidpointRounding.AwayFromZero);
        }

        quotation.Subtotal = quotation.Items.Sum(i => i.LineTotal);
        quotation.NetAmount = quotation.Subtotal - quotation.DiscountAmount + quotation.TaxAmount;
    }

    private SalesOrder BuildSalesOrderFromQuotation(Quotation quotation, Guid warehouseId, string orderNumber)
    {
        var salesOrder = new SalesOrder
        {
            OrderNumber = orderNumber,
            CustomerId = quotation.CustomerId,
            WarehouseId = warehouseId,
            OrderDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Status = SalesOrderStatus.Draft,
            Notes = $"Converted from Quotation {quotation.QuotationNumber}",
            CreatedBy = _currentUserService.UserId
        };

        foreach (var item in quotation.Items)
        {
            salesOrder.Items.Add(new SalesOrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                DiscountPct = item.DiscountPercent,
                CreatedBy = _currentUserService.UserId
            });
        }

        var subtotal = salesOrder.Items.Sum(i => i.LineTotal);
        salesOrder.DiscountAmount = quotation.DiscountAmount;
        salesOrder.TaxAmount = quotation.TaxAmount;
        salesOrder.NetAmount = subtotal - salesOrder.DiscountAmount + salesOrder.TaxAmount;
        salesOrder.TotalAmount = salesOrder.NetAmount;

        return salesOrder;
    }

    private static QuotationResponse MapToResponse(Quotation quotation)
    {
        return new QuotationResponse
        {
            Id = quotation.Id,
            QuotationNumber = quotation.QuotationNumber,
            CustomerId = quotation.CustomerId,
            CustomerName = quotation.Customer.Name,
            QuotationDate = quotation.QuotationDate,
            ExpiryDate = quotation.ExpiryDate,
            Subtotal = quotation.Subtotal,
            DiscountAmount = quotation.DiscountAmount,
            TaxAmount = quotation.TaxAmount,
            NetAmount = quotation.NetAmount,
            Status = quotation.Status,
            Notes = quotation.Notes,
            ConvertedSalesOrderId = quotation.ConvertedSalesOrderId,
            ConvertedSalesOrderNumber = quotation.ConvertedSalesOrder?.OrderNumber,
            CreatedAt = quotation.CreatedAt,
            Items = quotation.Items.Select(i => new QuotationItemResponse
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                ProductSku = i.Product.Sku,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                DiscountPercent = i.DiscountPercent,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }
}
