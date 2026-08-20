using Server.Core.Common;
using Server.Features.Sales.Entities;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Repositories;

public interface ISalesReturnRepository
{
    Task<PagedResult<SalesReturnListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, ReturnStatus? status,
        DateTime? fromDate, DateTime? toDate);
    Task<SalesReturnResponse?> GetByIdAsync(Guid id);
    Task<SalesReturn?> GetEntityByIdAsync(Guid id);
    Task<SalesReturn?> GetEntityWithItemsByIdAsync(Guid id);
    Task<string> GenerateReturnNumberAsync();
    Task<List<SalesOrderItem>> GetOriginalOrderItemsAsync(Guid orderId);
    Task<Dictionary<Guid, decimal>> GetReturnedQuantitiesAsync(Guid invoiceId);
    Task AddAsync(SalesReturn salesReturn);
    Task SoftDeleteAsync(Guid id, Guid userId);
}