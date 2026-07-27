using Server.Features.Security.Models;

namespace Server.Features.Security.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task RevokeTokenAsync(RevokeTokenRequest request);
}
