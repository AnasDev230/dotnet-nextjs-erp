using Server.Features.Security;

namespace Server.Features.Security.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<List<RefreshToken>> GetActiveByUserIdAsync(Guid userId);
    Task CreateAsync(RefreshToken refreshToken);
    void Update(RefreshToken refreshToken);
}
