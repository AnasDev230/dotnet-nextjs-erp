using Microsoft.AspNetCore.Identity;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Security.Repositories;
using Server.Features.Settings.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Settings.Services;

public class ProfileService : IProfileService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ICurrentUserService _currentUserService;

    public ProfileService(
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

    public async Task<ProfileResponse> GetAsync()
    {
        var user = await GetCurrentUserAsync();
        return await BuildResponseAsync(user);
    }

    public async Task<ProfileResponse> UpdateAsync(UpdateProfileRequest request)
    {
        var user = await GetCurrentUserAsync();

        user.FullName = request.FullName.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new BusinessException(BuildIdentityErrorMessage(result, "فشل تحديث بيانات الملف الشخصي"));

        return await BuildResponseAsync(user);
    }

    public async Task ChangePasswordAsync(ChangePasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmNewPassword)
            throw new BusinessException("كلمتا المرور غير متطابقتين");

        var user = await GetCurrentUserAsync();

        var currentPasswordValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
        if (!currentPasswordValid)
            throw new BusinessException("كلمة المرور الحالية غير صحيحة");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            throw new BusinessException(BuildIdentityErrorMessage(result, "فشل تغيير كلمة المرور"));

        // Invalidate all active refresh tokens to force a re-login for this user.
        var activeTokens = await _refreshTokenRepository.GetActiveByUserIdAsync(user.Id);
        foreach (var token in activeTokens)
            token.RevokedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private async Task<ApplicationUser> GetCurrentUserAsync()
    {
        var userId = _currentUserService.UserId
            ?? throw new BusinessException("المستخدم غير مصرح");

        return await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException(nameof(ApplicationUser), userId);
    }

    private async Task<ProfileResponse> BuildResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        return new ProfileResponse
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email,
            FullName = user.FullName,
            Role = roles.FirstOrDefault() ?? string.Empty,
            LastLogin = user.LastLogin
        };
    }

    private static string BuildIdentityErrorMessage(IdentityResult result, string fallback)
        => $"{fallback}: {string.Join("، ", result.Errors.Select(e => e.Description))}";
}