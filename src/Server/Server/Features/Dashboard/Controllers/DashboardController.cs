using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Features.Dashboard.Models;
using Server.Features.Dashboard.Services;

namespace Server.Features.Dashboard.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service) => _service = service;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _service.GetStatsAsync();
        return Ok(ApiResponse<DashboardStatsResponse>.SuccessResult(result));
    }

    [HttpGet("recent-orders")]
    public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 5)
    {
        var result = await _service.GetRecentOrdersAsync(count);
        return Ok(ApiResponse<List<RecentOrderResponse>>.SuccessResult(result));
    }

    [HttpGet("recent-invoices")]
    public async Task<IActionResult> GetRecentInvoices([FromQuery] int count = 5)
    {
        var result = await _service.GetRecentInvoicesAsync(count);
        return Ok(ApiResponse<List<RecentInvoiceResponse>>.SuccessResult(result));
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int count = 10)
    {
        var result = await _service.GetLowStockItemsAsync(count);
        return Ok(ApiResponse<List<LowStockItemResponse>>.SuccessResult(result));
    }
}
