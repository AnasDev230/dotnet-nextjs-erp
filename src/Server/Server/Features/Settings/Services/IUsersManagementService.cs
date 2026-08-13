using Server.Core.Common;
using Server.Features.Settings.Models;

namespace Server.Features.Settings.Services;

public interface IUsersManagementService
{
    Task<PagedResult<UserListItemResponse>> GetAllAsync(int page, int pageSize, string? search);
    Task<UserListItemResponse> CreateAsync(CreateUserRequest request);
    Task<UserListItemResponse> UpdateAsync(Guid id, UpdateUserRequest request);
    Task<UserListItemResponse> ToggleActiveAsync(Guid id);
}