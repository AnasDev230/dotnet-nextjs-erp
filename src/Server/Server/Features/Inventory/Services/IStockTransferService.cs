using Server.Core.Common;
using Server.Features.Inventory.Enums;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Services;

public interface IStockTransferService
{
    Task<PagedResult<StockTransferListItemResponse>> GetAllAsync(int page, int pageSize, StockTransferStatus? status = null);
    Task<StockTransferResponse> GetByIdAsync(Guid id);
    Task<StockTransferResponse> CreateAsync(CreateStockTransferRequest request);
    Task<StockTransferResponse> UpdateAsync(Guid id, UpdateStockTransferRequest request);
    Task SubmitAsync(Guid id);
    Task ApproveAsync(Guid id);
    Task CompleteAsync(Guid id);
    Task CancelAsync(Guid id);
    Task DeleteAsync(Guid id);
}
