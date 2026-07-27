using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Repositories;

public interface ICategoryRepository
{
    Task<PagedResult<CategoryListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm);
    Task<CategoryResponse?> GetByIdAsync(Guid id);
    Task<List<CategoryListItemResponse>> GetAllForDropdownAsync();
    Task<Category?> GetEntityByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null);
    Task<bool> ExistsByIdAsync(Guid id);
    Task<bool> HasSubCategoriesAsync(Guid id);
    Task AddAsync(Category category);
    void Update(Category category);
    void SoftDelete(Category category);
}
