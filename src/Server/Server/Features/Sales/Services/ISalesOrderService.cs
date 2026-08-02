using Server.Core.Common;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Services;

public interface ISalesOrderService
{
    Task<PagedResult<SalesOrderListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, SalesOrderStatus? status,
        DateOnly? fromDate, DateOnly? toDate);
    Task<SalesOrderResponse> GetByIdAsync(Guid id);
    Task<SalesOrderResponse> CreateAsync(CreateSalesOrderRequest request);
    Task<SalesOrderResponse> UpdateAsync(Guid id, UpdateSalesOrderRequest request);
    Task DeleteAsync(Guid id);
}
