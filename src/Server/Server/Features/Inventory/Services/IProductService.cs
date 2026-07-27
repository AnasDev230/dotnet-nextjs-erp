using Server.Core.Common;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Services;

public interface IProductService
{
    Task<PagedResult<ProductListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, Guid? categoryId, bool? isActive);
    Task<ProductResponse> GetByIdAsync(Guid id);
    Task<ProductResponse> CreateAsync(CreateProductRequest request);
    Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest request);
    Task DeleteAsync(Guid id);
}
