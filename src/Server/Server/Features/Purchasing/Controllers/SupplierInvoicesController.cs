using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Services;

namespace Server.Features.Purchasing.Controllers;

[ApiController]
[Route("api/supplier-invoices")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
public class SupplierInvoicesController : ControllerBase
{
    private readonly ISupplierInvoiceService _service;

    public SupplierInvoicesController(ISupplierInvoiceService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] SupplierInvoiceStatus? status = null,
        [FromQuery] Guid? supplierId = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, status, supplierId);
        return Ok(ApiResponse<PagedResult<SupplierInvoiceListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<SupplierInvoiceResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SupplierInvoiceResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSupplierInvoiceRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<SupplierInvoiceResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplierInvoiceRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<SupplierInvoiceResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/receive")]
    public async Task<IActionResult> Receive(Guid id)
    {
        await _service.ReceiveAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Supplier invoice received successfully"));
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _service.CancelAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Supplier invoice cancelled successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Supplier invoice deleted successfully"));
    }
}