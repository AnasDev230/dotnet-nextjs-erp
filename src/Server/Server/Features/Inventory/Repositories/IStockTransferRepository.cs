using Server.Core.Common;
using Server.Features.Inventory.Entities;
using Server.Features.Inventory.Enums;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Repositories;

public interface IStockTransferRepository
{
    Task<PagedResult<StockTransferListItemResponse>> GetAllAsync(int page, int pageSize, StockTransferStatus? status = null);
    Task<StockTransferResponse?> GetByIdAsync(Guid id);
    Task<StockTransfer?> GetEntityByIdAsync(Guid id);
    Task AddAsync(StockTransfer transfer);
    Task SoftDeleteAsync(Guid id, Guid userId);
    Task<string> GenerateTransferNumberAsync();
    Task<bool> HasActiveTransferAsync(Guid productId, Guid fromWarehouseId, Guid toWarehouseId, Guid? excludeId = null);
    Task<decimal> GetAvailableStockAsync(Guid productId, Guid warehouseId);
}
