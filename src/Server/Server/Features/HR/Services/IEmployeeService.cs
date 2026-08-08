using Server.Core.Common;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;

namespace Server.Features.HR.Services;

public interface IEmployeeService
{
    Task<PagedResult<EmployeeListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, Guid? departmentId, EmployeeStatus? status);
    Task<EmployeeResponse> GetByIdAsync(Guid id);
    Task<List<EmployeeListItemResponse>> GetAllForDropdownAsync();
    Task<EmployeeResponse> CreateAsync(CreateEmployeeRequest request);
    Task<EmployeeResponse> UpdateAsync(Guid id, UpdateEmployeeRequest request);
    Task DeleteAsync(Guid id);
}