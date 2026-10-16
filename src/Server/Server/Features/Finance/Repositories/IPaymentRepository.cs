using Server.Core.Common;
using Server.Features.Finance.Enums;
using Server.Features.Finance.Models;

namespace Server.Features.Finance.Repositories;

public interface IPaymentRepository
{
    Task<PagedResult<PaymentListResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        PaymentMethod? method, DateOnly? fromDate, DateOnly? toDate);
    Task<List<Payment>> GetByInvoiceIdAsync(Guid invoiceId);
    Task<Payment?> GetByIdAsync(Guid id);
    Task<decimal> GetTotalPaidByInvoiceIdAsync(Guid invoiceId);
    Task AddAsync(Payment payment);
    Task SoftDeleteAsync(Guid id, Guid userId);
}
