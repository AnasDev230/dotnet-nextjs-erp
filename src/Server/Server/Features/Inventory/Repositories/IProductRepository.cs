using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Repositories;

public interface IProductRepository
{
    Task<PagedResult<ProductListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, Guid? categoryId, bool? isActive);
    Task<ProductResponse?> GetByIdAsync(Guid id);
    Task<Product?> GetEntityByIdAsync(Guid id);
    Task<bool> ExistsBySkuAsync(string sku, Guid? excludeId = null);
    Task<bool> ExistsAsync(Guid id);
    Task AddAsync(Product product);
    void Update(Product product);
    void SoftDelete(Product product);
}
