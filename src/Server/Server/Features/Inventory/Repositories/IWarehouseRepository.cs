using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Repositories;

public interface IWarehouseRepository
{
    Task<PagedResult<WarehouseListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, bool? isActive);
    Task<WarehouseResponse?> GetByIdAsync(Guid id);
    Task<List<WarehouseListItemResponse>> GetAllForDropdownAsync();
    Task<bool> ExistsByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null);
    Task<Warehouse?> GetEntityByIdAsync(Guid id);
    Task<Warehouse> AddAsync(Warehouse warehouse);
    void Update(Warehouse warehouse);
    Task SoftDeleteAsync(Guid id, Guid userId);
}
