using Server.Features.Reports.Models;

namespace Server.Features.Reports.Services;

public interface IReportsService
{
    Task<SalesSummaryResponse> GetSalesSummaryAsync(ReportQueryParams queryParams);
    Task<PurchasesSummaryResponse> GetPurchasesSummaryAsync(ReportQueryParams queryParams);
    Task<InventorySummaryResponse> GetInventorySummaryAsync();
    Task<CustomerStatementResponse> GetCustomerStatementAsync(Guid customerId);
    Task<EmployeesSummaryResponse> GetEmployeesSummaryAsync();
    Task<byte[]> ExportSalesCsvAsync(ReportQueryParams queryParams);
    Task<byte[]> ExportPurchasesCsvAsync(ReportQueryParams queryParams);
    Task<byte[]> ExportInventoryCsvAsync();
    Task<byte[]> ExportCustomerStatementCsvAsync(Guid customerId);
    Task<byte[]> ExportEmployeesCsvAsync();
}