using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Services;

public interface ICategoryService
{
    Task<PagedResult<CategoryListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm);
    Task<CategoryResponse> GetByIdAsync(Guid id);
    Task<List<CategoryListItemResponse>> GetAllForDropdownAsync();
    Task<CategoryResponse> CreateAsync(CreateCategoryRequest request);
    Task<CategoryResponse> UpdateAsync(Guid id, UpdateCategoryRequest request);
    Task DeleteAsync(Guid id);
}
