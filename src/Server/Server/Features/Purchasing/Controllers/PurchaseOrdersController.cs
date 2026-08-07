using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Services;

namespace Server.Features.Purchasing.Controllers;

[ApiController]
[Route("api/purchase-orders")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager},{Roles.WarehouseKeeper}")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _service;

    public PurchaseOrdersController(IPurchaseOrderService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] PurchaseOrderStatus? status = null,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, supplierId, status, fromDate, toDate);
        return Ok(ApiResponse<PagedResult<PurchaseOrderListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<PurchaseOrderResponse>.SuccessResult(result));
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseOrderResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<PurchaseOrderResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePurchaseOrderRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<PurchaseOrderResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/submit")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _service.SubmitAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Purchase order submitted successfully"));
    }

    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _service.ApproveAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Purchase order approved successfully"));
    }

    [HttpPatch("{id:guid}/cancel")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _service.CancelAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Purchase order cancelled successfully"));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Purchase order deleted successfully"));
    }
}
