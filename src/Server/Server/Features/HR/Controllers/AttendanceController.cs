using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Features.HR.Services;

namespace Server.Features.HR.Controllers;

[ApiController]
[Route("api/attendance")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.HRManager}")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;

    public AttendanceController(IAttendanceService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? employeeId = null,
        [FromQuery] DateTime? date = null,
        [FromQuery] AttendanceStatus? status = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, employeeId, date, status, dateFrom, dateTo);
        return Ok(ApiResponse<PagedResult<AttendanceListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<AttendanceResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<AttendanceResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateAttendanceRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<AttendanceResponse>.SuccessResult(result));
    }

    [HttpPost("bulk")]
    [ProducesResponseType(typeof(ApiResponse<List<AttendanceResponse>>), StatusCodes.Status201Created)]
    public async Task<IActionResult> BulkCreate([FromBody] BulkAttendanceRequest request)
    {
        var result = await _service.BulkCreateAsync(request);
        return CreatedAtAction(nameof(GetAll), ApiResponse<List<AttendanceResponse>>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAttendanceRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<AttendanceResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Attendance deleted successfully"));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] Guid employeeId,
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var result = await _service.GetMonthlySummaryAsync(employeeId, year, month);
        return Ok(ApiResponse<AttendanceSummaryResponse>.SuccessResult(result));
    }
}
