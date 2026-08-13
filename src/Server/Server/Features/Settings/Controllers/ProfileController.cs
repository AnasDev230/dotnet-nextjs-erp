using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Features.Settings.Models;
using Server.Features.Settings.Services;

namespace Server.Features.Settings.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _service;

    public ProfileController(IProfileService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _service.GetAsync();
        return Ok(ApiResponse<ProfileResponse>.SuccessResult(result));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest request)
    {
        var result = await _service.UpdateAsync(request);
        return Ok(ApiResponse<ProfileResponse>.SuccessResult(result));
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        await _service.ChangePasswordAsync(request);
        return Ok(ApiResponse<string>.SuccessResult("تم تغيير كلمة المرور بنجاح"));
    }
}