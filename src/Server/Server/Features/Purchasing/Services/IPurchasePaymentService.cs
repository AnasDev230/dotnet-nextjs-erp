using Server.Core.Common;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Services;

public interface IPurchasePaymentService
{
    Task<PagedResult<PurchasePaymentResponse>> GetAllAsync(int page, int pageSize, Guid? supplierInvoiceId);
    Task<PurchasePaymentResponse> CreateAsync(CreatePurchasePaymentRequest request);
}