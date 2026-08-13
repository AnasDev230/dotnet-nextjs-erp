using Server.Features.Settings.Models;

namespace Server.Features.Settings.Services;

public interface IProfileService
{
    Task<ProfileResponse> GetAsync();
    Task<ProfileResponse> UpdateAsync(UpdateProfileRequest request);
    Task ChangePasswordAsync(ChangePasswordRequest request);
}