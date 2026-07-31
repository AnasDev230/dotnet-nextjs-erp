using Server.Core.Common;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Repositories;

public interface ICustomerRepository
{
    Task<PagedResult<CustomerListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, CustomerStatus? status, CustomerType? type);
    Task<CustomerResponse?> GetByIdAsync(Guid id);
    Task<List<CustomerListItemResponse>> GetAllForDropdownAsync();
    Task<Customer?> GetEntityByIdAsync(Guid id);
    Task<bool> ExistsByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null);
    Task<Customer> AddAsync(Customer customer);
    Task UpdateAsync(Customer customer);
    Task SoftDeleteAsync(Guid id, Guid userId);
}
