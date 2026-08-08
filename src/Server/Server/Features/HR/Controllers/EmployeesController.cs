using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Features.HR.Services;

namespace Server.Features.HR.Controllers;

[ApiController]
[Route("api/employees")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.HRManager}")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _service;

    public EmployeesController(IEmployeeService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] EmployeeStatus? status = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, departmentId, status);
        return Ok(ApiResponse<PagedResult<EmployeeListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetForDropdown()
    {
        var result = await _service.GetAllForDropdownAsync();
        return Ok(ApiResponse<List<EmployeeListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<EmployeeResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<EmployeeResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<EmployeeResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEmployeeRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<EmployeeResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Employee deleted successfully"));
    }
}