using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Features.Reports.Models;
using Server.Features.Reports.Services;

namespace Server.Features.Reports.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportsService _service;

    public ReportsController(IReportsService service) => _service = service;

    // ─── JSON Reports ───

    [HttpGet("sales")]
    public async Task<IActionResult> GetSalesSummary([FromQuery] ReportQueryParams queryParams)
    {
        var result = await _service.GetSalesSummaryAsync(queryParams);
        return Ok(ApiResponse<SalesSummaryResponse>.SuccessResult(result));
    }

    [HttpGet("purchases")]
    public async Task<IActionResult> GetPurchasesSummary([FromQuery] ReportQueryParams queryParams)
    {
        var result = await _service.GetPurchasesSummaryAsync(queryParams);
        return Ok(ApiResponse<PurchasesSummaryResponse>.SuccessResult(result));
    }

    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventorySummary()
    {
        var result = await _service.GetInventorySummaryAsync();
        return Ok(ApiResponse<InventorySummaryResponse>.SuccessResult(result));
    }

    [HttpGet("customer-statement/{customerId:guid}")]
    public async Task<IActionResult> GetCustomerStatement(Guid customerId)
    {
        var result = await _service.GetCustomerStatementAsync(customerId);
        return Ok(ApiResponse<CustomerStatementResponse>.SuccessResult(result));
    }

    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployeesSummary()
    {
        var result = await _service.GetEmployeesSummaryAsync();
        return Ok(ApiResponse<EmployeesSummaryResponse>.SuccessResult(result));
    }

    // ─── CSV Exports ───

    [HttpGet("export/sales")]
    public async Task<IActionResult> ExportSalesCsv([FromQuery] ReportQueryParams queryParams)
    {
        var csvBytes = await _service.ExportSalesCsvAsync(queryParams);
        return File(csvBytes, "text/csv", $"sales-report-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }

    [HttpGet("export/purchases")]
    public async Task<IActionResult> ExportPurchasesCsv([FromQuery] ReportQueryParams queryParams)
    {
        var csvBytes = await _service.ExportPurchasesCsvAsync(queryParams);
        return File(csvBytes, "text/csv", $"purchases-report-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }

    [HttpGet("export/inventory")]
    public async Task<IActionResult> ExportInventoryCsv()
    {
        var csvBytes = await _service.ExportInventoryCsvAsync();
        return File(csvBytes, "text/csv", $"inventory-report-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }

    [HttpGet("export/customer-statement/{customerId:guid}")]
    public async Task<IActionResult> ExportCustomerStatementCsv(Guid customerId)
    {
        var csvBytes = await _service.ExportCustomerStatementCsvAsync(customerId);
        return File(csvBytes, "text/csv", $"customer-statement-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }

    [HttpGet("export/employees")]
    public async Task<IActionResult> ExportEmployeesCsv()
    {
        var csvBytes = await _service.ExportEmployeesCsvAsync();
        return File(csvBytes, "text/csv", $"employees-report-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }
}