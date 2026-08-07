using Server.Core.Common;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Services;

public interface IPurchaseOrderService
{
    Task<PagedResult<PurchaseOrderListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? supplierId, PurchaseOrderStatus? status,
        DateOnly? fromDate, DateOnly? toDate);
    Task<PurchaseOrderResponse> GetByIdAsync(Guid id);
    Task<PurchaseOrderResponse> CreateAsync(CreatePurchaseOrderRequest request);
    Task<PurchaseOrderResponse> UpdateAsync(Guid id, UpdatePurchaseOrderRequest request);
    Task SubmitAsync(Guid id);
    Task ApproveAsync(Guid id);
    Task CancelAsync(Guid id);
    Task DeleteAsync(Guid id);
}
