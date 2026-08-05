using Server.Features.Finance.Models;

namespace Server.Features.Finance.Services;

public interface IPaymentService
{
    Task<PaymentResponse> CreateAsync(Guid invoiceId, CreatePaymentRequest request);
    Task<List<PaymentListItemResponse>> GetByInvoiceIdAsync(Guid invoiceId);
    Task DeleteAsync(Guid id);
}
