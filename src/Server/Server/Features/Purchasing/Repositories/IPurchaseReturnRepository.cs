using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Models;
using Server.Features.Sales.Enums;

namespace Server.Features.Purchasing.Repositories;

public interface IPurchaseReturnRepository
{
    Task<PagedResult<PurchaseReturnListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? supplierId, ReturnStatus? status,
        DateTime? fromDate, DateTime? toDate);
    Task<PurchaseReturnResponse?> GetByIdAsync(Guid id);
    Task<PurchaseReturn?> GetEntityByIdAsync(Guid id);
    Task<PurchaseReturn?> GetEntityWithItemsByIdAsync(Guid id);
    Task<string> GenerateReturnNumberAsync();
    Task<GoodsReceipt?> GetGrnWithItemsAsync(Guid grnId);
    Task<Dictionary<Guid, decimal>> GetReturnedQuantitiesAsync(Guid grnId);
    Task AddAsync(PurchaseReturn purchaseReturn);
    Task SoftDeleteAsync(Guid id, Guid userId);
}