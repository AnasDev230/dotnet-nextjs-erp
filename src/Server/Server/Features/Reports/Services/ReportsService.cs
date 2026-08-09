using Server.Features.Reports.Models;
using Server.Features.Reports.Repositories;

namespace Server.Features.Reports.Services;

public class ReportsService : IReportsService
{
    private readonly IReportsRepository _repository;

    public ReportsService(IReportsRepository repository)
    {
        _repository = repository;
    }

    public Task<SalesSummaryResponse> GetSalesSummaryAsync(ReportQueryParams queryParams)
        => _repository.GetSalesSummaryAsync(queryParams);

    public Task<PurchasesSummaryResponse> GetPurchasesSummaryAsync(ReportQueryParams queryParams)
        => _repository.GetPurchasesSummaryAsync(queryParams);

    public Task<InventorySummaryResponse> GetInventorySummaryAsync()
        => _repository.GetInventorySummaryAsync();

    public Task<CustomerStatementResponse> GetCustomerStatementAsync(Guid customerId)
        => _repository.GetCustomerStatementAsync(customerId);

    public Task<EmployeesSummaryResponse> GetEmployeesSummaryAsync()
        => _repository.GetEmployeesSummaryAsync();

    public async Task<byte[]> ExportSalesCsvAsync(ReportQueryParams queryParams)
    {
        var data = await _repository.GetSalesSummaryAsync(queryParams);

        var headers = new[] { "الفترة", "الإيراد", "عدد الطلبات" };
        var rows = data.ByPeriod.Select(item => new[]
        {
            item.Period,
            item.Revenue.ToString("F2"),
            item.OrderCount.ToString()
        }).ToList();

        return CsvExportHelper.GenerateCsv(headers, rows);
    }

    public async Task<byte[]> ExportPurchasesCsvAsync(ReportQueryParams queryParams)
    {
        var data = await _repository.GetPurchasesSummaryAsync(queryParams);

        var headers = new[] { "الفترة", "الإنفاق", "عدد أوامر الشراء" };
        var rows = data.ByPeriod.Select(item => new[]
        {
            item.Period,
            item.Spending.ToString("F2"),
            item.OrderCount.ToString()
        }).ToList();

        return CsvExportHelper.GenerateCsv(headers, rows);
    }

    public async Task<byte[]> ExportInventoryCsvAsync()
    {
        var data = await _repository.GetInventorySummaryAsync();

        var headers = new[] { "المنتج", "الرمز", "المستودع", "الكمية الحالية", "حد إعادة الطلب" };
        var rows = data.LowStockItems.Select(item => new[]
        {
            item.ProductName,
            item.Sku,
            item.WarehouseName,
            item.QuantityOnHand.ToString("F3"),
            item.ReorderLevel.ToString("F3")
        }).ToList();

        return CsvExportHelper.GenerateCsv(headers, rows);
    }

    public async Task<byte[]> ExportCustomerStatementCsvAsync(Guid customerId)
    {
        var data = await _repository.GetCustomerStatementAsync(customerId);

        var headers = new[] { "التاريخ", "النوع", "المرجع", "مدين", "دائن", "الرصيد" };
        var rows = data.Transactions.Select(t => new[]
        {
            t.Date.ToString("yyyy-MM-dd"),
            t.Type == "Invoice" ? "فاتورة" : "دفعة",
            t.Reference,
            t.Debit.ToString("F2"),
            t.Credit.ToString("F2"),
            t.RunningBalance.ToString("F2")
        }).ToList();

        return CsvExportHelper.GenerateCsv(headers, rows);
    }

    public async Task<byte[]> ExportEmployeesCsvAsync()
    {
        var data = await _repository.GetEmployeesSummaryAsync();

        var headers = new[] { "القسم", "عدد الموظفين", "إجمالي الرواتب" };
        var rows = data.ByDepartment.Select(item => new[]
        {
            item.DepartmentName,
            item.EmployeeCount.ToString(),
            item.TotalSalaries.ToString("F2")
        }).ToList();

        return CsvExportHelper.GenerateCsv(headers, rows);
    }
}