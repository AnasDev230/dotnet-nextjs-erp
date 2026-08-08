using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Services;

namespace Server.Features.Purchasing.Controllers;

[ApiController]
[Route("api/goods-receipts")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager},{Roles.WarehouseKeeper}")]
public class GoodsReceiptsController : ControllerBase
{
    private readonly IGoodsReceiptService _service;

    public GoodsReceiptsController(IGoodsReceiptService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? purchaseOrderId = null,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, purchaseOrderId, fromDate, toDate);
        return Ok(ApiResponse<PagedResult<GoodsReceiptListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<GoodsReceiptResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<GoodsReceiptResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateGoodsReceiptRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<GoodsReceiptResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/cancel")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _service.CancelAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Goods receipt cancelled successfully"));
    }
}