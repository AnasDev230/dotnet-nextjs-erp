using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Finance.Models;
using Server.Features.Finance.Repositories;
using Server.Features.Sales;
using Server.Features.Sales.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Finance.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _repository;
    private readonly ISalesOrderRepository _salesOrderRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public InvoiceService(
        IInvoiceRepository repository,
        ISalesOrderRepository salesOrderRepository,
        ICustomerRepository customerRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _salesOrderRepository = salesOrderRepository;
        _customerRepository = customerRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<InvoiceListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, InvoiceStatus? status,
        DateOnly? fromDate, DateOnly? toDate)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, customerId, status, fromDate, toDate);

    public async Task<InvoiceResponse> GetByIdAsync(Guid id)
    {
        var invoice = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Invoice), id);
        return MapToResponse(invoice);
    }

    public async Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request)
    {
        // 1. Validate the sales order
        var order = await _salesOrderRepository.GetByIdWithItemsAsync(request.OrderId)
            ?? throw new NotFoundException(nameof(SalesOrder), request.OrderId);

        if (order.Status != SalesOrderStatus.Confirmed)
            throw new BusinessException("لا يمكن إنشاء فاتورة إلا من أمر بيع مؤكد");

        // One-to-One check: an order cannot have more than one invoice
        var existingInvoice = await _repository.GetByOrderIdAsync(request.OrderId);
        if (existingInvoice != null)
            throw new BusinessException("يوجد فاتورة مسبقة لهذا الأمر البيع");

        // 2. Customer payment terms drive the due date
        var customer = await _customerRepository.GetEntityByIdAsync(order.CustomerId)
            ?? throw new NotFoundException(nameof(Customer), order.CustomerId);

        var dueDate = request.IssueDate.AddDays(customer.PaymentTerms);
        if (customer.PaymentTerms <= 0)
            dueDate = request.IssueDate;

        // 3. Auto-generate invoice number (INV-YYYY-XXXX)
        var invoiceNumber = await _repository.GenerateInvoiceNumberAsync();

        // 4. Copy financials from the confirmed order
        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            IssueDate = request.IssueDate,
            DueDate = dueDate,
            Subtotal = order.Items.Sum(i => i.LineTotal),
            DiscountAmount = order.DiscountAmount,
            TaxAmount = order.TaxAmount,
            NetAmount = order.NetAmount,
            PaidAmount = 0m,
            Status = InvoiceStatus.Draft,
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(invoice);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(invoice.Id);
    }

    public async Task<InvoiceResponse> IssueAsync(Guid id)
    {
        var invoice = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Invoice), id);

        if (invoice.Status != InvoiceStatus.Draft)
            throw new BusinessException("لا يمكن إصدار الفاتورة إلا من حالة المسودة");

        invoice.Status = InvoiceStatus.Issued;
        invoice.UpdatedBy = _currentUserService.UserId;
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<InvoiceResponse> CancelAsync(Guid id)
    {
        var invoice = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Invoice), id);

        if (invoice.Status == InvoiceStatus.Paid)
            throw new BusinessException("لا يمكن إلغاء فاتورة مدفوعة بالكامل");

        if (invoice.Payments.Any())
            throw new BusinessException("لا يمكن إلغاء فاتورة عليها دفعات مسجلة");

        invoice.Status = InvoiceStatus.Cancelled;
        invoice.UpdatedBy = _currentUserService.UserId;
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var invoice = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Invoice), id);

        // Only draft invoices can be deleted
        if (invoice.Status != InvoiceStatus.Draft)
            throw new BusinessException("لا يمكن حذف الفاتورة بعد إصدارها");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    private static InvoiceResponse MapToResponse(Invoice invoice)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Overdue is calculated at read time, not stored
        var isOverdue = (invoice.Status is InvoiceStatus.Issued or InvoiceStatus.PartiallyPaid)
                        && invoice.DueDate.HasValue
                        && invoice.DueDate < today;

        return new InvoiceResponse
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            OrderId = invoice.OrderId,
            OrderNumber = invoice.SalesOrder.OrderNumber,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer.Name,
            IssueDate = invoice.IssueDate,
            DueDate = invoice.DueDate,
            Subtotal = invoice.Subtotal,
            DiscountAmount = invoice.DiscountAmount,
            TaxAmount = invoice.TaxAmount,
            NetAmount = invoice.NetAmount,
            PaidAmount = invoice.PaidAmount,
            RemainingAmount = invoice.NetAmount - invoice.PaidAmount,
            Status = invoice.Status,
            IsOverdue = isOverdue,
            CreatedAt = invoice.CreatedAt,
            Payments = invoice.Payments
                .OrderByDescending(p => p.PaymentDate)
                .ThenByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponse
                {
                    Id = p.Id,
                    InvoiceId = p.InvoiceId,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    PaymentDate = p.PaymentDate,
                    Reference = p.Reference,
                    Notes = p.Notes,
                    CreatedAt = p.CreatedAt
                })
                .ToList()
        };
    }
}
