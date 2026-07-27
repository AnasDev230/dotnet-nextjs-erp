using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Services;

public interface IStockAdjustmentService
{
    Task<PagedResult<StockAdjustmentResponse>> GetAllAsync(int page, int pageSize, Guid? productId, Guid? warehouseId);
    Task<StockAdjustmentResponse> CreateAsync(CreateStockAdjustmentRequest request);
}
