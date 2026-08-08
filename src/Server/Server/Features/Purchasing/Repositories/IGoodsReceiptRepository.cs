using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Repositories;

public interface IGoodsReceiptRepository
{
    Task<PagedResult<GoodsReceiptListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? purchaseOrderId, DateOnly? fromDate, DateOnly? toDate);
    Task<GoodsReceiptResponse?> GetByIdAsync(Guid id);
    Task<GoodsReceipt?> GetByIdWithItemsAsync(Guid id);
    Task<string> GenerateGrnNumberAsync();
    Task AddAsync(GoodsReceipt receipt);
}