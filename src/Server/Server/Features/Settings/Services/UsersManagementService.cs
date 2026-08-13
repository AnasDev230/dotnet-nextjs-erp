using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Core.Exceptions;
using Server.Features.Security.Repositories;
using Server.Features.Settings.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Settings.Services;

public class UsersManagementService : IUsersManagementService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ICurrentUserService _currentUserService;

    public UsersManagementService(
        UserManager<ApplicationUser> userManager,
        AppDbContext context,
        IRefreshTokenRepository refreshTokenRepository,
        ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _context = context;
        _refreshTokenRepository = refreshTokenRepository;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<UserListItemResponse>> GetAllAsync(int page, int pageSize, string? search)
    {
        var query = _context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(u =>
                (u.UserName != null && u.UserName.ToLower().Contains(term)) ||
                (u.Email != null && u.Email.ToLower().Contains(term)) ||
                u.FullName.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListItemResponse
            {
                Id = u.Id,
                UserName = u.UserName!,
                Email = u.Email,
                FullName = u.FullName,
                Role = _context.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name!)
                    .FirstOrDefault() ?? string.Empty,
                IsActive = u.IsActive,
                LastLogin = u.LastLogin,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<UserListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<UserListItemResponse> CreateAsync(CreateUserRequest request)
    {
        ValidateRole(request.Role);

        if (await _userManager.FindByNameAsync(request.UserName) is not null)
            throw new BusinessException($"اسم المستخدم '{request.UserName}' مستخدم مسبقاً");

        if (await _userManager.FindByEmailAsync(request.Email) is not null)
            throw new BusinessException($"البريد الإلكتروني '{request.Email}' مستخدم مسبقاً");

        var user = new ApplicationUser
        {
            UserName = request.UserName.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            EmailConfirmed = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
            throw new BusinessException(BuildIdentityErrorMessage(createResult, "فشل إنشاء المستخدم"));

        var roleResult = await _userManager.AddToRoleAsync(user, request.Role);
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            throw new BusinessException(BuildIdentityErrorMessage(roleResult, "فشل تعيين الدور للمستخدم"));
        }

        return await BuildResponseAsync(user);
    }

    public async Task<UserListItemResponse> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        ValidateRole(request.Role);

        var user = await _userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException(nameof(ApplicationUser), id);

        var existingRoles = await _userManager.GetRolesAsync(user);
        var oldRole = existingRoles.FirstOrDefault();

        if (IsCurrentUser(user.Id) && oldRole == Roles.SuperAdmin && request.Role != oldRole)
            throw new BusinessException("لا يمكنك تغيير دورك الخاص أثناء تسجيل الدخول");

        user.FullName = request.FullName.Trim();
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            throw new BusinessException(BuildIdentityErrorMessage(updateResult, "فشل تحديث بيانات المستخدم"));

        if (oldRole != request.Role)
        {
            var roleResult = await UpdateRoleAsync(user, oldRole, request.Role);
            if (!roleResult.Succeeded)
                throw new BusinessException(BuildIdentityErrorMessage(roleResult, "فشل تحديث دور المستخدم"));
        }

        return await BuildResponseAsync(user);
    }

    public async Task<UserListItemResponse> ToggleActiveAsync(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException(nameof(ApplicationUser), id);

        if (IsCurrentUser(user.Id))
            throw new BusinessException("لا يمكنك إيقاف حسابك الخاص");

        user.IsActive = !user.IsActive;

        if (!user.IsActive)
        {
            var activeTokens = await _refreshTokenRepository.GetActiveByUserIdAsync(user.Id);
            foreach (var token in activeTokens)
                token.RevokedAt = DateTime.UtcNow;
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            throw new BusinessException(BuildIdentityErrorMessage(updateResult, "فشل تحديث حالة المستخدم"));

        await _context.SaveChangesAsync();

        return await BuildResponseAsync(user);
    }

    private async Task<UserListItemResponse> BuildResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        return new UserListItemResponse
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email,
            FullName = user.FullName,
            Role = roles.FirstOrDefault() ?? string.Empty,
            IsActive = user.IsActive,
            LastLogin = user.LastLogin,
            CreatedAt = user.CreatedAt
        };
    }

    private bool IsCurrentUser(Guid userId)
        => _currentUserService.UserId.HasValue && _currentUserService.UserId.Value == userId;

    private static void ValidateRole(string role)
    {
        if (!Roles.AllManagers.Contains(role))
            throw new BusinessException($"الدور '{role}' غير صالح");
    }

    private async Task<IdentityResult> UpdateRoleAsync(ApplicationUser user, string? oldRole, string newRole)
    {
        if (!string.IsNullOrEmpty(oldRole))
        {
            var removeResult = await _userManager.RemoveFromRoleAsync(user, oldRole);
            if (!removeResult.Succeeded)
                return removeResult;
        }

        return await _userManager.AddToRoleAsync(user, newRole);
    }

    private static string BuildIdentityErrorMessage(IdentityResult result, string fallback)
        => $"{fallback}: {string.Join("، ", result.Errors.Select(e => e.Description))}";
}