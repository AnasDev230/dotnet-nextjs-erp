using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Features.HR.Services;

namespace Server.Features.HR.Controllers;

[ApiController]
[Route("api/leave-requests")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.HRManager}")]
public class LeaveRequestsController : ControllerBase
{
    private readonly ILeaveRequestService _service;

    public LeaveRequestsController(ILeaveRequestService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? employeeId = null,
        [FromQuery] LeaveStatus? status = null,
        [FromQuery] LeaveType? leaveType = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, employeeId, status, leaveType, dateFrom, dateTo);
        return Ok(ApiResponse<PagedResult<LeaveRequestListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<LeaveRequestResponse>.SuccessResult(result));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] Guid employeeId, [FromQuery] int year)
    {
        var result = await _service.GetYearSummaryAsync(employeeId, year);
        return Ok(ApiResponse<LeaveSummaryResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LeaveRequestResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateLeaveRequestRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<LeaveRequestResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLeaveRequestRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<LeaveRequestResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _service.ApproveAsync(id);
        return Ok(ApiResponse<LeaveRequestResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectLeaveRequestRequest request)
    {
        var result = await _service.RejectAsync(id, request);
        return Ok(ApiResponse<LeaveRequestResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelLeaveRequestRequest? request)
    {
        var result = await _service.CancelAsync(id, request);
        return Ok(ApiResponse<LeaveRequestResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Leave request deleted successfully"));
    }
}
