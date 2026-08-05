using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Finance.Models;
using Server.Features.Finance.Services;

namespace Server.Features.Finance.Controllers;

[ApiController]
[Route("api/invoices")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _service;

    public InvoicesController(IInvoiceService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] InvoiceStatus? status = null,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, customerId, status, fromDate, toDate);
        return Ok(ApiResponse<PagedResult<InvoiceListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<InvoiceResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<InvoiceResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<InvoiceResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/issue")]
    public async Task<IActionResult> Issue(Guid id)
    {
        var result = await _service.IssueAsync(id);
        return Ok(ApiResponse<InvoiceResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var result = await _service.CancelAsync(id);
        return Ok(ApiResponse<InvoiceResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Invoice deleted successfully"));
    }
}
