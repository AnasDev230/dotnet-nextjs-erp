using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Persistence;

namespace Server.Features.Finance.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
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
