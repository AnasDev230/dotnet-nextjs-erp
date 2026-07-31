using Server.Core.Common;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Services;

public interface ICustomerService
{
    Task<PagedResult<CustomerListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, CustomerStatus? status, CustomerType? type);
    Task<CustomerResponse> GetByIdAsync(Guid id);
    Task<List<CustomerListItemResponse>> GetAllForDropdownAsync();
    Task<CustomerResponse> CreateAsync(CreateCustomerRequest request);
    Task<CustomerResponse> UpdateAsync(Guid id, UpdateCustomerRequest request);
    Task DeleteAsync(Guid id);
}
