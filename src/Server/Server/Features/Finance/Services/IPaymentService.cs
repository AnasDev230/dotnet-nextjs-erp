using Server.Core.Common;
using Server.Features.Finance.Enums;
using Server.Features.Finance.Models;

namespace Server.Features.Finance.Services;

public interface IPaymentService
{
    Task<PagedResult<PaymentListResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        PaymentMethod? method, DateOnly? fromDate, DateOnly? toDate);
    Task<PaymentResponse> CreateAsync(Guid invoiceId, CreatePaymentRequest request);
    Task<List<PaymentListItemResponse>> GetByInvoiceIdAsync(Guid invoiceId);
    Task DeleteAsync(Guid id);
}
