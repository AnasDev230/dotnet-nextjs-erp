using Server.Features.Dashboard.Models;

namespace Server.Features.Dashboard.Services;

public interface IDashboardService
{
    Task<DashboardStatsResponse> GetStatsAsync();
    Task<List<RecentOrderResponse>> GetRecentOrdersAsync(int count = 5);
    Task<List<RecentInvoiceResponse>> GetRecentInvoicesAsync(int count = 5);
    Task<List<LowStockItemResponse>> GetLowStockItemsAsync(int count = 10);
}
