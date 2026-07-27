using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Persistence;

namespace Server.Features.Security.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _context;

    public RefreshTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _context.Set<RefreshToken>()
            .Include(rt => rt.User)
            .SingleOrDefaultAsync(rt => rt.Token == token);
    }

    public async Task<List<RefreshToken>> GetActiveByUserIdAsync(Guid userId)
    {
        return await _context.Set<RefreshToken>()
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task CreateAsync(RefreshToken refreshToken)
    {
        await _context.Set<RefreshToken>().AddAsync(refreshToken);
    }

    public void Update(RefreshToken refreshToken)
    {
        _context.Set<RefreshToken>().Update(refreshToken);
    }
}
