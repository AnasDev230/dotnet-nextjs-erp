using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Services;

namespace Server.Features.Inventory.Controllers;

[ApiController]
[Route("api/stock-adjustments")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
public class StockAdjustmentsController : ControllerBase
{
    private readonly IStockAdjustmentService _service;

    public StockAdjustmentsController(IStockAdjustmentService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? productId = null,
        [FromQuery] Guid? warehouseId = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, productId, warehouseId);
        return Ok(ApiResponse<PagedResult<StockAdjustmentResponse>>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<StockAdjustmentResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateStockAdjustmentRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetAll), ApiResponse<StockAdjustmentResponse>.SuccessResult(result));
    }
}
