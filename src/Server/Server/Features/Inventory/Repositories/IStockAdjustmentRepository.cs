using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Repositories;

public interface IStockAdjustmentRepository
{
    Task<PagedResult<StockAdjustmentResponse>> GetAllAsync(int page, int pageSize, Guid? productId, Guid? warehouseId);
    Task<StockAdjustment> AddAsync(StockAdjustment adjustment);
}
