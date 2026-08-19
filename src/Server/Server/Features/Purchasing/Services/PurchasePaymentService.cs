using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Services;

public class PurchasePaymentService : IPurchasePaymentService
{
    private readonly IPurchasePaymentRepository _repository;
    private readonly ISupplierInvoiceRepository _supplierInvoiceRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public PurchasePaymentService(
        IPurchasePaymentRepository repository,
        ISupplierInvoiceRepository supplierInvoiceRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _supplierInvoiceRepository = supplierInvoiceRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<PurchasePaymentResponse>> GetAllAsync(
        int page, int pageSize, Guid? supplierInvoiceId)
        => await _repository.GetAllAsync(page, pageSize, supplierInvoiceId);

    public async Task<PurchasePaymentResponse> CreateAsync(CreatePurchasePaymentRequest request)
    {
        // 1. Validate invoice exists
        var invoice = await _supplierInvoiceRepository.GetEntityByIdAsync(request.SupplierInvoiceId)
            ?? throw new NotFoundException(nameof(SupplierInvoice), request.SupplierInvoiceId);

        if (invoice.Status is not (SupplierInvoiceStatus.Received or SupplierInvoiceStatus.PartiallyPaid))
            throw new BusinessException("لا يمكن تسجيل دفعة لفاتورة غير مستلمة أو مدفوعة أو ملغاة");

        // 2. Validate amount
        if (request.Amount <= 0)
            throw new BusinessException("يجب أن يكون مبلغ الدفعة أكبر من صفر");

        var remaining = invoice.NetAmount - invoice.PaidAmount;
        if (request.Amount > remaining)
            throw new BusinessException($"لا يمكن أن تتجاوز الدفعة المبلغ المتبقي ({remaining:N2})");

        // 3. Persist payment + update invoice within a single transaction
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var payment = new PurchasePayment
            {
                SupplierInvoiceId = request.SupplierInvoiceId,
                Amount = request.Amount,
                Method = request.Method,
                PaymentDate = request.PaymentDate,
                Reference = request.Reference,
                Notes = request.Notes,
                CreatedBy = _currentUserService.UserId
            };

            await _repository.AddAsync(payment);

            invoice.PaidAmount += request.Amount;
            invoice.Status = invoice.PaidAmount >= invoice.NetAmount
                ? SupplierInvoiceStatus.Paid
                : SupplierInvoiceStatus.PartiallyPaid;
            invoice.UpdatedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new PurchasePaymentResponse
            {
                Id = payment.Id,
                Amount = payment.Amount,
                Method = payment.Method,
                PaymentDate = payment.PaymentDate,
                Reference = payment.Reference,
                Notes = payment.Notes
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}