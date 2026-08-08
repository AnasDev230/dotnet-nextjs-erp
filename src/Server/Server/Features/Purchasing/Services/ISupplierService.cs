using Server.Core.Common;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Services;

public interface ISupplierService
{
    Task<PagedResult<SupplierListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, SupplierStatus? status);
    Task<SupplierResponse> GetByIdAsync(Guid id);
    Task<List<SupplierListItemResponse>> GetForDropdownAsync();
    Task<SupplierResponse> CreateAsync(CreateSupplierRequest request);
    Task<SupplierResponse> UpdateAsync(Guid id, UpdateSupplierRequest request);
    Task SuspendAsync(Guid id);
    Task ActivateAsync(Guid id);
    Task DeleteAsync(Guid id);
}
