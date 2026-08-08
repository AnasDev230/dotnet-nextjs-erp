using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;

namespace Server.Features.HR.Repositories;

public interface IEmployeeRepository
{
    Task<PagedResult<EmployeeListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, Guid? departmentId, EmployeeStatus? status);
    Task<EmployeeResponse?> GetByIdAsync(Guid id);
    Task<Employee?> GetEntityByIdAsync(Guid id);
    Task<bool> ExistsByIdAsync(Guid id);
    Task<string> GenerateEmployeeNumberAsync();
    Task<bool> IsEmailAsync(string email, Guid? excludeId = null);
    Task<List<EmployeeListItemResponse>> GetAllForDropdownAsync();
    Task AddAsync(Employee employee);
    Task SoftDeleteAsync(Guid id, Guid userId);
    Task<bool> DepartmentIdExistsAsync(Guid departmentId);
    Task<bool> UserIdExistsAsync(Guid userId);
    Task<bool> IsUserIdLinkedAsync(Guid userId, Guid? excludeEmployeeId = null);
    Task<bool> IsManagerOfOthersAsync(Guid employeeId);
    Task<bool> IsDepartmentManagerAsync(Guid employeeId);
}