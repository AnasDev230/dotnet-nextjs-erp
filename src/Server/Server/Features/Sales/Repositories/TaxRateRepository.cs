using Microsoft.EntityFrameworkCore;
using Server.Features.Sales.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Repositories;

public class TaxRateRepository : ITaxRateRepository
{
    private readonly AppDbContext _context;

    public TaxRateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaxRateResponse>> GetActiveAsync()
    {
        return await _context.TaxRates
            .AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.Rate)
            .Select(t => new TaxRateResponse
            {
                Id = t.Id,
                Name = t.Name,
                Rate = t.Rate
            })
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.TaxRates
            .AsNoTracking()
            .AnyAsync(t => t.Id == id);
    }

    public async Task<decimal?> GetRateAsync(Guid id)
    {
        return await _context.TaxRates
            .AsNoTracking()
            .Where(t => t.Id == id)
            .Select(t => (decimal?)t.Rate)
            .FirstOrDefaultAsync();
    }
}
