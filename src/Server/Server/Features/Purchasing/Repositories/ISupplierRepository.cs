using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Repositories;

public interface ISupplierRepository
{
    Task<PagedResult<SupplierListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, SupplierStatus? status);
    Task<Supplier?> GetByIdAsync(Guid id);
    Task<Supplier?> GetEntityByIdAsync(Guid id);
    Task<string> GenerateCodeAsync();
    Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null);
    Task AddAsync(Supplier supplier);
    Task SoftDeleteAsync(Guid id, Guid userId);
    Task<bool> HasUnfulfilledOrdersAsync(Guid supplierId);
}
