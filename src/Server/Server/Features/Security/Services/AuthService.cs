using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Server.Core.Exceptions;
using Server.Features.Security.Models;
using Server.Features.Security.Repositories;
using Server.Infrastructure.Persistence;
using Server.Infrastructure.Services;

namespace Server.Features.Security.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly AppDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IRefreshTokenRepository refreshTokenRepository,
        AppDbContext context,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _refreshTokenRepository = refreshTokenRepository;
        _context = context;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !user.IsActive)
            throw new BusinessException("Invalid email or password.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
            throw new BusinessException("Invalid email or password.");

        var roles = await _userManager.GetRolesAsync(user);

        var (accessToken, expiresAt) = GenerateAccessToken(user, roles);
        var (rawRefreshToken, _) = await GenerateRefreshTokenAsync(user.Id);

        user.LastLogin = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            ExpiresAt = expiresAt,
            FullName = user.FullName,
            Email = user.Email!,
            Roles = roles.ToList()
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var storedToken = await _refreshTokenRepository.GetByTokenAsync(HashToken(request.RefreshToken));
        if (storedToken is null || !storedToken.IsActive)
            throw new BusinessException("Invalid or expired refresh token.");

        // Rotate: revoke old, issue new
        storedToken.RevokedAt = DateTime.UtcNow;

        var user = storedToken.User;
        if (!user.IsActive)
            throw new BusinessException("User account is deactivated.");

        var roles = await _userManager.GetRolesAsync(user);

        var (accessToken, expiresAt) = GenerateAccessToken(user, roles);
        var (rawRefreshToken, newRefreshToken) = await GenerateRefreshTokenAsync(user.Id);
        storedToken.ReplacedByToken = newRefreshToken.Token;

        _refreshTokenRepository.Update(storedToken);
        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            ExpiresAt = expiresAt,
            FullName = user.FullName,
            Email = user.Email!,
            Roles = roles.ToList()
        };
    }

    public async Task RevokeTokenAsync(RevokeTokenRequest request)
    {
        var storedToken = await _refreshTokenRepository.GetByTokenAsync(HashToken(request.RefreshToken));
        if (storedToken is null)
            throw new NotFoundException("Refresh token not found.");

        storedToken.RevokedAt = DateTime.UtcNow;
        _refreshTokenRepository.Update(storedToken);
        await _context.SaveChangesAsync();
    }

    private (string token, DateTime expiresAt) GenerateAccessToken(ApplicationUser user, IList<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(tokenDescriptor), expiresAt);
    }

    private async Task<(string rawToken, RefreshToken token)> GenerateRefreshTokenAsync(Guid userId)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        var rawToken = Convert.ToBase64String(randomBytes);

        var refreshToken = new RefreshToken
        {
            Token = HashToken(rawToken),
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            CreatedAt = DateTime.UtcNow
        };

        await _refreshTokenRepository.CreateAsync(refreshToken);

        return (rawToken, refreshToken);
    }

    private static string HashToken(string token)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hashBytes);
    }
}
