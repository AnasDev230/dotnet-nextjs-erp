using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.HR.Models;
using Server.Features.HR.Services;

namespace Server.Features.HR.Controllers;

[ApiController]
[Route("api/payroll")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.HRManager}")]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _service;

    public PayrollController(IPayrollService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _service.GetAllRunsAsync(page, pageSize);
        return Ok(ApiResponse<PagedResult<PayrollRunListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetRunByIdAsync(id);
        return Ok(ApiResponse<PayrollRunResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PayrollRunResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePayrollRunRequest request)
    {
        var result = await _service.CreatePayrollRunAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<PayrollRunResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/mark-paid")]
    public async Task<IActionResult> MarkAsPaid(Guid id)
    {
        var result = await _service.MarkAsPaidAsync(id);
        return Ok(ApiResponse<PayrollRunResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteRunAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Payroll run deleted successfully"));
    }

    [HttpGet("{id:guid}/details")]
    public async Task<IActionResult> GetDetails(Guid id)
    {
        var result = await _service.GetDetailsByRunIdAsync(id);
        return Ok(ApiResponse<List<PayrollDetailListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}/details/{empId:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, Guid empId)
    {
        var result = await _service.GetDetailByIdAsync(empId);
        return Ok(ApiResponse<PayrollDetailResponse>.SuccessResult(result));
    }
}
