using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Features.Sales.Services;

namespace Server.Features.Sales.Controllers;

[ApiController]
[Route("api/sales-orders")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager},{Roles.WarehouseKeeper}")]
public class SalesOrdersController : ControllerBase
{
    private readonly ISalesOrderService _service;

    public SalesOrdersController(ISalesOrderService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] SalesOrderStatus? status = null,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, customerId, status, fromDate, toDate);
        return Ok(ApiResponse<PagedResult<SalesOrderListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<SalesOrderResponse>.SuccessResult(result));
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
    [ProducesResponseType(typeof(ApiResponse<SalesOrderResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSalesOrderRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<SalesOrderResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSalesOrderRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<SalesOrderResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Sales order deleted successfully"));
    }
}
