using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Finance.Models;
using Server.Features.Finance.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Finance.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IInvoiceRepository invoiceRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _paymentRepository = paymentRepository;
        _invoiceRepository = invoiceRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PaymentResponse> CreateAsync(Guid invoiceId, CreatePaymentRequest request)
    {
        var invoice = await _invoiceRepository.GetEntityByIdAsync(invoiceId)
            ?? throw new NotFoundException(nameof(Invoice), invoiceId);

        // Payments are only allowed on issued invoices (issued or partially paid)
        if (invoice.Status is not (InvoiceStatus.Issued or InvoiceStatus.PartiallyPaid))
            throw new BusinessException("لا يمكن تسجيل دفعة على فاتورة غير صادرة");

        if (request.Amount <= 0)
            throw new BusinessException("المبلغ يجب أن يكون أكبر من صفر");

        var remaining = invoice.NetAmount - invoice.PaidAmount;
        if (request.Amount > remaining)
            throw new BusinessException($"المبلغ يتجاوز المبلغ المتبقي ({remaining:N2})");

        // Payment + invoice update MUST be committed atomically
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var payment = new Payment
            {
                InvoiceId = invoice.Id,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                PaymentDate = request.PaymentDate,
                Reference = request.Reference,
                Notes = request.Notes,
                CreatedBy = _currentUserService.UserId
            };

            await _paymentRepository.AddAsync(payment);

            invoice.PaidAmount += request.Amount;
            invoice.Status = invoice.PaidAmount >= invoice.NetAmount
                ? InvoiceStatus.Paid
                : InvoiceStatus.PartiallyPaid;
            invoice.UpdatedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToResponse(payment);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<PaymentListItemResponse>> GetByInvoiceIdAsync(Guid invoiceId)
    {
        // Ensure the invoice exists
        if (await _invoiceRepository.GetEntityByIdAsync(invoiceId) is null)
            throw new NotFoundException(nameof(Invoice), invoiceId);

        var payments = await _paymentRepository.GetByInvoiceIdAsync(invoiceId);

        return payments.Select(p => new PaymentListItemResponse
        {
            Id = p.Id,
            InvoiceId = p.InvoiceId,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            PaymentDate = p.PaymentDate,
            Reference = p.Reference,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt
        }).ToList();
    }

    public async Task DeleteAsync(Guid id)
    {
        var payment = await _paymentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Payment), id);

        var invoice = await _invoiceRepository.GetEntityByIdAsync(payment.InvoiceId)
            ?? throw new NotFoundException(nameof(Invoice), payment.InvoiceId);

        if (invoice.Status == InvoiceStatus.Paid)
            throw new BusinessException("لا يمكن حذف دفعة من فاتورة مدفوعة بالكامل");

        // Payment deletion + invoice recalculation MUST be committed atomically
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _paymentRepository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);

            // Recalculate paid amount from the remaining payments. The to-be-deleted
            // payment is still present in the database until SaveChanges runs, so it
            // is explicitly excluded here.
            var remainingPayments = await _paymentRepository.GetByInvoiceIdAsync(invoice.Id);
            invoice.PaidAmount = remainingPayments.Where(p => p.Id != payment.Id).Sum(p => p.Amount);
            invoice.Status = invoice.PaidAmount <= 0m
                ? InvoiceStatus.Issued
                : invoice.PaidAmount >= invoice.NetAmount
                    ? InvoiceStatus.Paid
                    : InvoiceStatus.PartiallyPaid;
            invoice.UpdatedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static PaymentResponse MapToResponse(Payment payment)
        => new()
        {
            Id = payment.Id,
            InvoiceId = payment.InvoiceId,
            Amount = payment.Amount,
            PaymentMethod = payment.PaymentMethod,
            PaymentDate = payment.PaymentDate,
            Reference = payment.Reference,
            Notes = payment.Notes,
            CreatedAt = payment.CreatedAt
        };
}
