using Server.Features.Dashboard.Models;
using Server.Features.Dashboard.Repositories;

namespace Server.Features.Dashboard.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;

    public DashboardService(IDashboardRepository repository)
    {
        _repository = repository;
    }

    public Task<DashboardStatsResponse> GetStatsAsync() => _repository.GetStatsAsync();

    public Task<List<RecentOrderResponse>> GetRecentOrdersAsync(int count = 5)
        => _repository.GetRecentOrdersAsync(count);

    public Task<List<RecentInvoiceResponse>> GetRecentInvoicesAsync(int count = 5)
        => _repository.GetRecentInvoicesAsync(count);

    public Task<List<LowStockItemResponse>> GetLowStockItemsAsync(int count = 10)
        => _repository.GetLowStockItemsAsync(count);
}
