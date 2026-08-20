using Server.Core.Common;
using Server.Features.Purchasing.Models;
using Server.Features.Sales.Enums;

namespace Server.Features.Purchasing.Services;

public interface IPurchaseReturnService
{
    Task<PagedResult<PurchaseReturnListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? supplierId, ReturnStatus? status,
        DateTime? fromDate, DateTime? toDate);
    Task<PurchaseReturnResponse> GetByIdAsync(Guid id);
    Task<PurchaseReturnResponse> CreateAsync(CreatePurchaseReturnRequest request);
    Task SubmitAsync(Guid id);
    Task ApproveAsync(Guid id);
    Task CompleteAsync(Guid id);
    Task CancelAsync(Guid id);
    Task DeleteAsync(Guid id);
}