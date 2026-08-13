using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Settings.Models;
using Server.Features.Settings.Services;

namespace Server.Features.Settings.Controllers;

[ApiController]
[Route("api/settings/users")]
[Authorize(Roles = Roles.SuperAdmin)]
public class UsersManagementController : ControllerBase
{
    private readonly IUsersManagementService _service;

    public UsersManagementController(IUsersManagementService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search);
        return Ok(ApiResponse<PagedResult<UserListItemResponse>>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserListItemResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetAll), new { page = 1, pageSize = 20 }, ApiResponse<UserListItemResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<UserListItemResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        var result = await _service.ToggleActiveAsync(id);
        return Ok(ApiResponse<UserListItemResponse>.SuccessResult(result));
    }
}