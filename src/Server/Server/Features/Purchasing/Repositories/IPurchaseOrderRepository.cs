using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Repositories;

public interface IPurchaseOrderRepository
{
    Task<PagedResult<PurchaseOrderListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? supplierId, PurchaseOrderStatus? status,
        DateOnly? fromDate, DateOnly? toDate);
    Task<PurchaseOrderResponse?> GetByIdAsync(Guid id);
    Task<PurchaseOrder?> GetByIdWithItemsAsync(Guid id);
    Task<string> GeneratePoNumberAsync();
    Task AddAsync(PurchaseOrder order);
    Task SoftDeleteAsync(Guid id, Guid userId);
}