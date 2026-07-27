using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Services;

public interface IWarehouseService
{
    Task<PagedResult<WarehouseListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, bool? isActive);
    Task<WarehouseResponse> GetByIdAsync(Guid id);
    Task<List<WarehouseListItemResponse>> GetAllForDropdownAsync();
    Task<WarehouseResponse> CreateAsync(CreateWarehouseRequest request);
    Task<WarehouseResponse> UpdateAsync(Guid id, UpdateWarehouseRequest request);
    Task DeleteAsync(Guid id);
}
