using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Inventory.Enums;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Services;

namespace Server.Features.Inventory.Controllers;

[ApiController]
[Route("api/stock-transfers")]
[Authorize]
public class StockTransfersController : ControllerBase
{
    private readonly IStockTransferService _service;

    public StockTransfersController(IStockTransferService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] StockTransferStatus? status = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, status);
        return Ok(ApiResponse<PagedResult<StockTransferListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<StockTransferResponse>.SuccessResult(result));
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
    [ProducesResponseType(typeof(ApiResponse<StockTransferResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateStockTransferRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<StockTransferResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStockTransferRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<StockTransferResponse>.SuccessResult(result));
    }

    [HttpPatch("{id:guid}/submit")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _service.SubmitAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Stock transfer submitted successfully"));
    }

    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _service.ApproveAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Stock transfer approved successfully"));
    }

    [HttpPatch("{id:guid}/complete")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
    public async Task<IActionResult> Complete(Guid id)
    {
        await _service.CompleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Stock transfer completed successfully"));
    }

    [HttpPatch("{id:guid}/cancel")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _service.CancelAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Stock transfer cancelled successfully"));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.WarehouseKeeper}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Stock transfer deleted successfully"));
    }
}
