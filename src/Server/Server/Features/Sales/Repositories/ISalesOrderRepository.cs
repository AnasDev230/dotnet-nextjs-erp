using Server.Core.Common;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Repositories;

public interface ISalesOrderRepository
{
    Task<PagedResult<SalesOrderListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, SalesOrderStatus? status,
        DateOnly? fromDate, DateOnly? toDate);
    Task<SalesOrderResponse?> GetByIdAsync(Guid id);
    Task<SalesOrder?> GetByIdWithItemsAsync(Guid id);
    Task<string> GenerateOrderNumberAsync();
    Task<SalesOrder> AddAsync(SalesOrder order);
    Task SoftDeleteAsync(Guid id, Guid userId);
}
