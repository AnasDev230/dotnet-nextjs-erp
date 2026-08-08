using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Models;

namespace Server.Features.HR.Repositories;

public interface IDepartmentRepository
{
    Task<PagedResult<DepartmentListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, bool? isActive);
    Task<DepartmentResponse?> GetByIdAsync(Guid id);
    Task<Department?> GetEntityByIdAsync(Guid id);
    Task<bool> ExistsByIdAsync(Guid id);
    Task<string> GenerateCodeAsync();
    Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null);
    Task<List<DepartmentListItemResponse>> GetAllForDropdownAsync();
    Task AddAsync(Department department);
    Task SoftDeleteAsync(Guid id, Guid userId);
    Task<bool> HasEmployeesAsync(Guid departmentId);
    Task<bool> HasChildrenAsync(Guid departmentId);
}