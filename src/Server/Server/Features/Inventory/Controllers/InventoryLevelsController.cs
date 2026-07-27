using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Services;

namespace Server.Features.Inventory.Controllers;

[ApiController]
[Route("api/inventory-levels")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper},{Roles.SalesManager}")]
public class InventoryLevelsController : ControllerBase
{
    private readonly IInventoryLevelService _service;

    public InventoryLevelsController(IInventoryLevelService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? productId = null,
        [FromQuery] Guid? warehouseId = null,
        [FromQuery] bool? lowStockOnly = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, productId, warehouseId, lowStockOnly);
        return Ok(ApiResponse<PagedResult<InventoryLevelListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<InventoryLevelResponse>.SuccessResult(result));
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
    [ProducesResponseType(typeof(ApiResponse<InventoryLevelResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Upsert([FromBody] UpsertInventoryLevelRequest request)
    {
        var result = await _service.UpsertAsync(request);
        return Ok(ApiResponse<InventoryLevelResponse>.SuccessResult(result));
    }
}
