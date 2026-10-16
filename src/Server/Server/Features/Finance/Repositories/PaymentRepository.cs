using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Finance.Enums;
using Server.Features.Finance.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Finance.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<PaymentListResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        PaymentMethod? method, DateOnly? fromDate, DateOnly? toDate)
    {
        var query = _context.Payments
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(p =>
                p.Invoice.InvoiceNumber.ToLower().Contains(term) ||
                p.Invoice.Customer.Name.ToLower().Contains(term) ||
                (p.Reference != null && p.Reference.ToLower().Contains(term)));
        }

        if (method.HasValue)
            query = query.Where(p => p.PaymentMethod == method.Value);

        if (fromDate.HasValue)
            query = query.Where(p => p.PaymentDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(p => p.PaymentDate <= toDate.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PaymentListResponse
            {
                Id = p.Id,
                InvoiceId = p.InvoiceId,
                InvoiceNumber = p.Invoice.InvoiceNumber,
                CustomerName = p.Invoice.Customer.Name,
                Amount = p.Amount,
                PaymentMethod = p.PaymentMethod,
                PaymentDate = p.PaymentDate,
                Reference = p.Reference,
                Notes = p.Notes,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<PaymentListResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<List<Payment>> GetByInvoiceIdAsync(Guid invoiceId)
    {
        return await _context.Payments
            .AsNoTracking()
            .Where(p => p.InvoiceId == invoiceId)
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _context.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<decimal> GetTotalPaidByInvoiceIdAsync(Guid invoiceId)
    {
        return await _context.Payments
            .AsNoTracking()
            .Where(p => p.InvoiceId == invoiceId)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;
    }

    public async Task AddAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.Id == id);

        if (payment is not null)
        {
            payment.DeletedAt = DateTime.UtcNow;
            payment.UpdatedBy = userId;
        }
    }
}
