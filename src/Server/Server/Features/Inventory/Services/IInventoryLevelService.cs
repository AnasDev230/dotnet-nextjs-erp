using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Services;

public interface IInventoryLevelService
{
    Task<PagedResult<InventoryLevelListItemResponse>> GetAllAsync(
        int page, int pageSize, Guid? productId, Guid? warehouseId, bool? lowStockOnly);
    Task<InventoryLevelResponse> GetByIdAsync(Guid id);
    Task<InventoryLevelResponse> UpsertAsync(UpsertInventoryLevelRequest request);
}
