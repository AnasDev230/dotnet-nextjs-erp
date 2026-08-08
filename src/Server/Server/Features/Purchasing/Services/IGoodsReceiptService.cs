using Server.Core.Common;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Services;

public interface IGoodsReceiptService
{
    Task<PagedResult<GoodsReceiptListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? purchaseOrderId, DateOnly? fromDate, DateOnly? toDate);
    Task<GoodsReceiptResponse> GetByIdAsync(Guid id);
    Task<GoodsReceiptResponse> CreateAsync(CreateGoodsReceiptRequest request);
    Task CancelAsync(Guid id);
}