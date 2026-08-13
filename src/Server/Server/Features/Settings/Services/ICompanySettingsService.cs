using Server.Features.Settings.Models;

namespace Server.Features.Settings.Services;

public interface ICompanySettingsService
{
    Task<CompanySettingsResponse> GetAsync();
    Task<CompanySettingsResponse> UpdateAsync(UpdateCompanySettingsRequest request);
}