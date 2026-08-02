using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Repositories;

public interface IInventoryLevelRepository
{
    Task<PagedResult<InventoryLevelListItemResponse>> GetAllAsync(
        int page, int pageSize, Guid? productId, Guid? warehouseId, bool? lowStockOnly);
    Task<InventoryLevelResponse?> GetByIdAsync(Guid id);
    Task<InventoryLevel?> FindByProductAndWarehouseAsync(Guid productId, Guid warehouseId);
    Task<InventoryLevel?> FindByProductIdAsync(Guid productId);
    Task<InventoryLevel> AddAsync(InventoryLevel level);
    void Update(InventoryLevel level);
}
