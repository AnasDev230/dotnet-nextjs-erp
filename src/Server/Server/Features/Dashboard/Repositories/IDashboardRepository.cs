using Server.Features.Dashboard.Models;

namespace Server.Features.Dashboard.Repositories;

public interface IDashboardRepository
{
    Task<DashboardStatsResponse> GetStatsAsync();
    Task<List<RecentOrderResponse>> GetRecentOrdersAsync(int count);
    Task<List<RecentInvoiceResponse>> GetRecentInvoicesAsync(int count);
    Task<List<LowStockItemResponse>> GetLowStockItemsAsync(int count);
}
