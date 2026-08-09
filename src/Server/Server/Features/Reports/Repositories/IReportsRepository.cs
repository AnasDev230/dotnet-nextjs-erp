using Server.Features.Reports.Models;

namespace Server.Features.Reports.Repositories;

public interface IReportsRepository
{
    Task<SalesSummaryResponse> GetSalesSummaryAsync(ReportQueryParams queryParams);
    Task<PurchasesSummaryResponse> GetPurchasesSummaryAsync(ReportQueryParams queryParams);
    Task<InventorySummaryResponse> GetInventorySummaryAsync();
    Task<CustomerStatementResponse> GetCustomerStatementAsync(Guid customerId);
    Task<EmployeesSummaryResponse> GetEmployeesSummaryAsync();
}