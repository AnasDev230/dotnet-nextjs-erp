using Server.Features.Sales.Models;

namespace Server.Features.Sales.Repositories;

public interface ITaxRateRepository
{
    Task<List<TaxRateResponse>> GetActiveAsync();
    Task<bool> ExistsAsync(Guid id);
    Task<decimal?> GetRateAsync(Guid id);
}
