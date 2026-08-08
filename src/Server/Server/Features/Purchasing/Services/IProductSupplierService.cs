using Server.Core.Common;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Services;

public interface IProductSupplierService
{
    Task<PagedResult<ProductSupplierListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? productId, Guid? supplierId);
    Task<ProductSupplierResponse> CreateAsync(CreateProductSupplierRequest request);
    Task<ProductSupplierResponse> GetByIdAsync(Guid id);
    Task<List<ProductSupplierListItemResponse>> GetByProductIdAsync(Guid productId);
    Task<List<ProductSupplierListItemResponse>> GetBySupplierIdAsync(Guid supplierId);
    Task<ProductSupplierResponse> UpdateAsync(Guid id, UpdateProductSupplierRequest request);
    Task DeleteAsync(Guid id);
}