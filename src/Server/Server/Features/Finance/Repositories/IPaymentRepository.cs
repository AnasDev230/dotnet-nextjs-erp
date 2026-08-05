namespace Server.Features.Finance.Repositories;

public interface IPaymentRepository
{
    Task<List<Payment>> GetByInvoiceIdAsync(Guid invoiceId);
    Task<Payment?> GetByIdAsync(Guid id);
    Task<decimal> GetTotalPaidByInvoiceIdAsync(Guid invoiceId);
    Task AddAsync(Payment payment);
    Task SoftDeleteAsync(Guid id, Guid userId);
}
