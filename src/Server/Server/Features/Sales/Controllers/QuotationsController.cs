using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Features.Sales.Services;

namespace Server.Features.Sales.Controllers;

[ApiController]
[Route("api/quotations")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
public class QuotationsController : ControllerBase
{
    private readonly IQuotationService _service;

    public QuotationsController(IQuotationService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] QuotationStatus? status = null,
        [FromQuery] Guid? customerId = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, status, customerId);
        return Ok(ApiResponse<PagedResult<QuotationListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<QuotationResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<QuotationResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateQuotationRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<QuotationResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateQuotationRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<QuotationResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/send")]
    public async Task<IActionResult> Send(Guid id)
    {
        await _service.SendAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Quotation sent successfully"));
    }

    [HttpPatch("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id)
    {
        await _service.AcceptAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Quotation accepted successfully"));
    }

    [HttpPatch("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        await _service.RejectAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Quotation rejected successfully"));
    }

    [HttpPost("{id:guid}/convert")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Convert(Guid id, [FromBody] ConvertQuotationRequest? request)
    {
        var salesOrderId = await _service.ConvertToSalesOrderAsync(id, request?.WarehouseId);
        return Ok(ApiResponse<object>.SuccessResult(new { salesOrderId }));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Quotation deleted successfully"));
    }
}
