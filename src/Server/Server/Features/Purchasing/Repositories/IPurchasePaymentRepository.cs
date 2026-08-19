using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Repositories;

public interface IPurchasePaymentRepository
{
    Task<PagedResult<PurchasePaymentResponse>> GetAllAsync(int page, int pageSize, Guid? supplierInvoiceId);
    Task<PurchasePayment?> GetByIdAsync(Guid id);
    Task AddAsync(PurchasePayment payment);
    Task<decimal> GetTotalPaidAsync(Guid supplierInvoiceId);
}