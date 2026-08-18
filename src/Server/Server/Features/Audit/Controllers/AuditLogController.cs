using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Audit.Models;
using Server.Features.Audit.Services;

namespace Server.Features.Audit.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Roles = Roles.SuperAdmin)]
public class AuditLogController : ControllerBase
{
    private readonly IAuditLogService _service;

    public AuditLogController(IAuditLogService service) => _service = service;

    /// <summary>Get paginated audit logs with filters.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AuditLogQueryParams queryParams)
    {
        var result = await _service.GetAllAsync(queryParams);
        return Ok(ApiResponse<PagedResult<AuditLogListItemResponse>>.SuccessResult(result));
    }

    /// <summary>Get a single audit log entry.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<AuditLogListItemResponse>.SuccessResult(result));
    }

    /// <summary>Get distinct table names for filter dropdown.</summary>
    [HttpGet("filters/tables")]
    public async Task<IActionResult> GetTableNames()
    {
        var result = await _service.GetDistinctTableNamesAsync();
        return Ok(ApiResponse<List<string>>.SuccessResult(result));
    }

    /// <summary>Get distinct user names for filter dropdown.</summary>
    [HttpGet("filters/users")]
    public async Task<IActionResult> GetUserNames()
    {
        var result = await _service.GetDistinctUserNamesAsync();
        return Ok(ApiResponse<List<string>>.SuccessResult(result));
    }
}