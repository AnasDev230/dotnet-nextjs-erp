using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Services;

namespace Server.Features.Inventory.Controllers;

[ApiController]
[Route("api/warehouses")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _service;

    public WarehousesController(IWarehouseService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, isActive);
        return Ok(ApiResponse<PagedResult<WarehouseListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetForDropdown()
    {
        var result = await _service.GetAllForDropdownAsync();
        return Ok(ApiResponse<List<WarehouseListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<WarehouseResponse>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WarehouseResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateWarehouseRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<WarehouseResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWarehouseRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<WarehouseResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Warehouse deleted successfully"));
    }
}
