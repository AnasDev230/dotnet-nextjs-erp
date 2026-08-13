using Server.Features.Settings.Entities;

namespace Server.Features.Settings.Repositories;

public interface ICompanySettingsRepository
{
    Task<CompanySettings?> GetAsync();
    Task AddAsync(CompanySettings entity);
    void Update(CompanySettings entity);
}