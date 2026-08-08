using Server.Core.Common;
using Server.Features.HR.Models;

namespace Server.Features.HR.Services;

public interface IDepartmentService
{
    Task<PagedResult<DepartmentListItemResponse>> GetAllAsync(int page, int pageSize, string? searchTerm, bool? isActive);
    Task<DepartmentResponse> GetByIdAsync(Guid id);
    Task<List<DepartmentListItemResponse>> GetAllForDropdownAsync();
    Task<DepartmentResponse> CreateAsync(CreateDepartmentRequest request);
    Task<DepartmentResponse> UpdateAsync(Guid id, UpdateDepartmentRequest request);
    Task DeleteAsync(Guid id);
}