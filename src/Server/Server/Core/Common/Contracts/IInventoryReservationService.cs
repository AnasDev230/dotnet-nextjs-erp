namespace Server.Core.Common.Contracts;

/// <summary>
/// Cross-feature contract used by the Sales module to reserve and release
/// stock inside the Inventory module. Implemented by the Inventory feature
/// so that Sales never touches Inventory entities directly.
/// </summary>
public interface IInventoryReservationService
{
    Task ReserveStockAsync(Guid warehouseId, Guid orderId, IReadOnlyCollection<StockReservationItem> items);
    Task ReleaseStockAsync(Guid orderId);
}
