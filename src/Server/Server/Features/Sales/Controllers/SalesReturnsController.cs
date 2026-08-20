using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Features.Sales.Services;

namespace Server.Features.Sales.Controllers;

[ApiController]
[Route("api/sales-returns")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
public class SalesReturnsController : ControllerBase
{
    private readonly ISalesReturnService _service;

    public SalesReturnsController(ISalesReturnService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] ReturnStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, customerId, status, fromDate, toDate);
        return Ok(ApiResponse<PagedResult<SalesReturnListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<SalesReturnResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SalesReturnResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSalesReturnRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<SalesReturnResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _service.SubmitAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Sales return submitted successfully"));
    }

    [HttpPatch("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _service.ApproveAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Sales return approved successfully"));
    }

    [HttpPatch("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        await _service.CompleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Sales return completed successfully"));
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _service.CancelAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Sales return cancelled successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Sales return deleted successfully"));
    }
}