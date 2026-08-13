using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Settings.Models;
using Server.Features.Settings.Services;

namespace Server.Features.Settings.Controllers;

[ApiController]
[Route("api/settings/company")]
[Authorize(Roles = Roles.SuperAdmin)]
public class CompanySettingsController : ControllerBase
{
    private readonly ICompanySettingsService _service;

    public CompanySettingsController(ICompanySettingsService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _service.GetAsync();
        return Ok(ApiResponse<CompanySettingsResponse>.SuccessResult(result));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateCompanySettingsRequest request)
    {
        var result = await _service.UpdateAsync(request);
        return Ok(ApiResponse<CompanySettingsResponse>.SuccessResult(result));
    }
}