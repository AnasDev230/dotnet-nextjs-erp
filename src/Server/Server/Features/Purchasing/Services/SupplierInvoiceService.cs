using Server.Core.Common;
using Server.Core.Constants;
using Server.Core.Exceptions;
using Server.Features.Notifications.Enums;
using Server.Features.Notifications.Services;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Services;

public class SupplierInvoiceService : ISupplierInvoiceService
{
    private readonly ISupplierInvoiceRepository _repository;
    private readonly IPurchaseOrderRepository _purchaseOrderRepository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SupplierInvoiceService(
        ISupplierInvoiceRepository repository,
        IPurchaseOrderRepository purchaseOrderRepository,
        ISupplierRepository supplierRepository,
        INotificationService notificationService,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _purchaseOrderRepository = purchaseOrderRepository;
        _supplierRepository = supplierRepository;
        _notificationService = notificationService;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<SupplierInvoiceListItemResponse>> GetAllAsync(
        int page, int pageSize, SupplierInvoiceStatus? status, Guid? supplierId)
        => await _repository.GetAllAsync(page, pageSize, status, supplierId);

    public async Task<SupplierInvoiceResponse> GetByIdAsync(Guid id)
    {
        var invoice = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(SupplierInvoice), id);
        return invoice;
    }

    public async Task<SupplierInvoiceResponse> CreateAsync(CreateSupplierInvoiceRequest request)
    {
        if (request.Subtotal < 0 || request.TaxAmount < 0)
            throw new BusinessException("لا يمكن أن تكون المبالغ سالبة");

        // 1. Validate purchase order exists and is invoiceable
        var order = await _purchaseOrderRepository.GetByIdWithItemsAsync(request.PurchaseOrderId)
            ?? throw new NotFoundException(nameof(PurchaseOrder), request.PurchaseOrderId);

        if (order.Status is not (PurchaseOrderStatus.Approved
            or PurchaseOrderStatus.PartiallyReceived
            or PurchaseOrderStatus.Received))
            throw new BusinessException("لا يمكن إنشاء فاتورة مورد إلا لأمر شراء معتمد أو مستلم");

        if (request.SupplierId != order.SupplierId)
            throw new BusinessException("المورد لا يطابق مورد أمر الشراء");

        // 2. Validate supplier exists and is active
        var supplier = await _supplierRepository.GetEntityByIdAsync(request.SupplierId)
            ?? throw new NotFoundException(nameof(Supplier), request.SupplierId);

        if (supplier.Status != SupplierStatus.Active)
            throw new BusinessException("لا يمكن إنشاء فاتورة مورد لمورد موقوف");

        // 3. Validate no existing invoice for this PO
        if (await _repository.HasInvoiceForPurchaseOrderAsync(request.PurchaseOrderId))
            throw new BusinessException("يوجد بالفعل فاتورة مورد لأمر الشراء هذا");

        // 4. Generate invoice number
        var invoiceNumber = await _repository.GenerateInvoiceNumberAsync();

        var invoice = new SupplierInvoice
        {
            InvoiceNumber = invoiceNumber,
            PurchaseOrderId = request.PurchaseOrderId,
            SupplierId = request.SupplierId,
            IssueDate = request.IssueDate,
            DueDate = request.DueDate,
            Subtotal = request.Subtotal,
            TaxAmount = request.TaxAmount,
            NetAmount = request.Subtotal + request.TaxAmount,
            PaidAmount = 0,
            Status = SupplierInvoiceStatus.Draft,
            Notes = request.Notes,
            SupplierReference = request.SupplierReference,
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(invoice);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(invoice.Id);
    }

    public async Task<SupplierInvoiceResponse> UpdateAsync(Guid id, UpdateSupplierInvoiceRequest request)
    {
        var invoice = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(SupplierInvoice), id);

        if (invoice.Status != SupplierInvoiceStatus.Draft)
            throw new BusinessException("لا يمكن تعديل الفاتورة إلا في حالة المسودة");

        if (request.Subtotal < 0 || request.TaxAmount < 0)
            throw new BusinessException("لا يمكن أن تكون المبالغ سالبة");

        invoice.IssueDate = request.IssueDate;
        invoice.DueDate = request.DueDate;
        invoice.Subtotal = request.Subtotal;
        invoice.TaxAmount = request.TaxAmount;
        invoice.NetAmount = request.Subtotal + request.TaxAmount;
        invoice.Notes = request.Notes;
        invoice.SupplierReference = request.SupplierReference;
        invoice.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task ReceiveAsync(Guid id)
    {
        var invoice = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(SupplierInvoice), id);

        if (invoice.Status != SupplierInvoiceStatus.Draft)
            throw new BusinessException("لا يمكن استلام الفاتورة إلا من حالة المسودة");

        invoice.Status = SupplierInvoiceStatus.Received;
        invoice.UpdatedBy = _currentUserService.UserId;

        await _notificationService.CreateForRoleAsync(
            Roles.PurchasingManager,
            NotificationType.SupplierInvoiceReceived,
            "تم استلام فاتورة مورد",
            $"فاتورة المورد {invoice.InvoiceNumber} جاهزة للمراجعة والسداد",
            invoice.Id);

        await _context.SaveChangesAsync();
    }

    public async Task CancelAsync(Guid id)
    {
        var invoice = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(SupplierInvoice), id);

        if (invoice.Status is not (SupplierInvoiceStatus.Draft or SupplierInvoiceStatus.Received))
            throw new BusinessException("لا يمكن إلغاء الفاتورة في حالتها الحالية");

        if (invoice.PaidAmount > 0)
            throw new BusinessException("لا يمكن إلغاء فاتورة تم سداد جزء منها");

        invoice.Status = SupplierInvoiceStatus.Cancelled;
        invoice.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var invoice = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(SupplierInvoice), id);

        if (invoice.Status != SupplierInvoiceStatus.Draft)
            throw new BusinessException("لا يمكن حذف الفاتورة إلا في حالة المسودة");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }
}