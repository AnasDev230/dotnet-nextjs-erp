using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Repositories;

public interface IProductSupplierRepository
{
    Task<List<ProductSupplierListItemResponse>> GetByProductIdAsync(Guid productId);
    Task<List<ProductSupplierListItemResponse>> GetBySupplierIdAsync(Guid supplierId);
    Task<ProductSupplierResponse?> GetByIdAsync(Guid id);
    Task<ProductSupplier?> GetEntityByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid productId, Guid supplierId, Guid? excludeId = null);
    Task AddAsync(ProductSupplier productSupplier);
    Task UnsetPrimaryAsync(Guid productId, Guid excludeId);
    Task SoftDeleteAsync(Guid id, Guid userId);
}