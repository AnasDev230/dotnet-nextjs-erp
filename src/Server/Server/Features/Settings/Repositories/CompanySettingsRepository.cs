using Microsoft.EntityFrameworkCore;
using Server.Features.Settings.Entities;
using Server.Infrastructure.Persistence;

namespace Server.Features.Settings.Repositories;

public class CompanySettingsRepository : ICompanySettingsRepository
{
    private readonly AppDbContext _context;

    public CompanySettingsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CompanySettings?> GetAsync()
        => await _context.CompanySettings
            .AsNoTracking()
            .FirstOrDefaultAsync();

    public async Task AddAsync(CompanySettings entity)
        => await _context.CompanySettings.AddAsync(entity);

    public void Update(CompanySettings entity)
        => _context.CompanySettings.Update(entity);
}