using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Common.Contracts;
using Server.Core.Constants;
using Server.Core.Exceptions;
using Server.Features.Notifications.Enums;
using Server.Features.Notifications.Services;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Services;

/// <summary>
/// Phase 3: Inventory reservation. Mutates InventoryLevels (quantity_reserved)
/// and writes StockMovement audit records. All changes are committed by a
/// single SaveChangesAsync call and must be wrapped in an outer transaction
/// by the caller (SalesOrderService).
/// </summary>
public class InventoryReservationService : IInventoryReservationService
{
    private const string SalesOrderReference = "SalesOrder";
    private const string InvoiceReference = "Invoice";
    private const string ReservationMovement = "SalesReservation";
    private const string ReleaseMovement = "SalesRelease";
    private const string SaleMovement = "Sale";
    private const string SaleReversalMovement = "SaleReversal";

    private sealed record NetReservation(Guid ProductId, Guid WarehouseId, decimal Quantity);

    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public InventoryReservationService(
        AppDbContext context,
        INotificationService notificationService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _notificationService = notificationService;
        _currentUserService = currentUserService;
    }

    public async Task ReserveStockAsync(Guid warehouseId, Guid orderId, IReadOnlyCollection<StockReservationItem> items)
    {
        foreach (var item in items)
        {
            // 1. Read-only availability check (no tracking)
            var snapshot = await _context.InventoryLevels
                .AsNoTracking()
                .Include(l => l.Product)
                .FirstOrDefaultAsync(l => l.ProductId == item.ProductId && l.WarehouseId == warehouseId)
                ?? throw new BusinessException(
                    $"Product is not stocked in the selected warehouse. ProductId: {item.ProductId}, WarehouseId: {warehouseId}");

            var available = snapshot.QuantityOnHand - snapshot.QuantityReserved;
            if (available < item.Quantity)
            {
                throw new BusinessException(
                    $"Insufficient stock for product {snapshot.Product.Name}. Available: {available}, Requested: {item.Quantity}");
            }

            // 2. Fetch tracked entity and increase the reserved quantity
            var level = await _context.InventoryLevels
                .FirstOrDefaultAsync(l => l.ProductId == item.ProductId && l.WarehouseId == warehouseId)
                ?? throw new BusinessException(
                    $"Product is not stocked in the selected warehouse. ProductId: {item.ProductId}, WarehouseId: {warehouseId}");

            level.QuantityReserved += item.Quantity;
            level.LastMovement = DateTime.UtcNow;
            level.UpdatedBy = _currentUserService.UserId;

            // Low-stock crossing: notify only when this reservation pushes
            // available stock to/below the reorder level (prevents repeat alerts).
            var availableAfter = available - item.Quantity;
            if (available > snapshot.Product.ReorderLevel && availableAfter <= snapshot.Product.ReorderLevel)
            {
                await _notificationService.CreateForRoleAsync(
                    Roles.WarehouseKeeper,
                    NotificationType.LowStock,
                    "تنبيه: مخزون منخفض",
                    $"المنتج '{snapshot.Product.Name}' وصل إلى حد إعادة الطلب. المتاح: {availableAfter}",
                    item.ProductId);

                await _notificationService.CreateForRoleAsync(
                    Roles.SuperAdmin,
                    NotificationType.LowStock,
                    "تنبيه: مخزون منخفض",
                    $"المنتج '{snapshot.Product.Name}' وصل إلى حد إعادة الطلب. المتاح: {availableAfter}",
                    item.ProductId);
            }

            // 3. Audit trail
            _context.StockMovements.Add(new StockMovement
            {
                MovementType = ReservationMovement,
                ReferenceType = SalesOrderReference,
                ReferenceId = orderId,
                ProductId = item.ProductId,
                WarehouseId = warehouseId,
                Quantity = item.Quantity,
                MovementDate = DateTime.UtcNow,
                CreatedBy = _currentUserService.UserId,
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task ReleaseStockAsync(Guid orderId)
    {
        var reservations = await GetNetReservationsAsync(orderId);

        foreach (var reservation in reservations)
        {
            var level = await _context.InventoryLevels
                .FirstOrDefaultAsync(l => l.ProductId == reservation.ProductId && l.WarehouseId == reservation.WarehouseId)
                ?? throw new BusinessException(
                    $"Inventory level not found for product {reservation.ProductId} in warehouse {reservation.WarehouseId}.");

            if (level.QuantityReserved < reservation.Quantity)
            {
                throw new BusinessException(
                    $"Reserved quantity is lower than the quantity to release for product {reservation.ProductId}. " +
                    $"Reserved: {level.QuantityReserved}, To release: {reservation.Quantity}.");
            }

            level.QuantityReserved -= reservation.Quantity;
            level.LastMovement = DateTime.UtcNow;
            level.UpdatedBy = _currentUserService.UserId;

            _context.StockMovements.Add(new StockMovement
            {
                MovementType = ReleaseMovement,
                ReferenceType = SalesOrderReference,
                ReferenceId = orderId,
                ProductId = reservation.ProductId,
                WarehouseId = reservation.WarehouseId,
                Quantity = -reservation.Quantity,
                MovementDate = DateTime.UtcNow,
                Notes = $"Release reservation for order {orderId}",
                CreatedBy = _currentUserService.UserId,
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task CommitReservationAsync(Guid orderId, Guid invoiceId)
    {
        var alreadyCommitted = await _context.StockMovements
            .AnyAsync(m => m.ReferenceType == InvoiceReference
                           && m.ReferenceId == invoiceId
                           && m.MovementType == SaleMovement);

        if (alreadyCommitted)
            return;

        var reservations = await GetNetReservationsAsync(orderId);

        foreach (var reservation in reservations)
        {
            var level = await _context.InventoryLevels
                .FirstOrDefaultAsync(l => l.ProductId == reservation.ProductId && l.WarehouseId == reservation.WarehouseId)
                ?? throw new BusinessException(
                    $"Inventory level not found for product {reservation.ProductId} in warehouse {reservation.WarehouseId}.");

            if (level.QuantityOnHand < reservation.Quantity)
            {
                throw new BusinessException(
                    $"Insufficient on-hand stock for product {reservation.ProductId}. " +
                    $"On hand: {level.QuantityOnHand}, Required: {reservation.Quantity}.");
            }

            if (level.QuantityReserved < reservation.Quantity)
            {
                throw new BusinessException(
                    $"Reserved quantity is lower than the committed quantity for product {reservation.ProductId}. " +
                    $"Reserved: {level.QuantityReserved}, Committed: {reservation.Quantity}.");
            }

            level.QuantityOnHand -= reservation.Quantity;
            level.QuantityReserved -= reservation.Quantity;
            level.LastMovement = DateTime.UtcNow;
            level.UpdatedBy = _currentUserService.UserId;

            _context.StockMovements.Add(new StockMovement
            {
                MovementType = ReleaseMovement,
                ReferenceType = SalesOrderReference,
                ReferenceId = orderId,
                ProductId = reservation.ProductId,
                WarehouseId = reservation.WarehouseId,
                Quantity = -reservation.Quantity,
                MovementDate = DateTime.UtcNow,
                Notes = $"Reservation committed for invoice {invoiceId}",
                CreatedBy = _currentUserService.UserId,
            });

            _context.StockMovements.Add(new StockMovement
            {
                MovementType = SaleMovement,
                ReferenceType = InvoiceReference,
                ReferenceId = invoiceId,
                ProductId = reservation.ProductId,
                WarehouseId = reservation.WarehouseId,
                Quantity = -reservation.Quantity,
                UnitCost = level.AvgCost,
                TotalCost = reservation.Quantity * level.AvgCost,
                MovementDate = DateTime.UtcNow,
                Notes = $"Sale for invoice {invoiceId}",
                CreatedBy = _currentUserService.UserId,
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task RevertInvoiceStockAsync(Guid orderId, Guid invoiceId)
    {
        var alreadyReverted = await _context.StockMovements
            .AnyAsync(m => m.ReferenceType == InvoiceReference
                           && m.ReferenceId == invoiceId
                           && m.MovementType == SaleReversalMovement);

        if (alreadyReverted)
            return;

        var sales = await _context.StockMovements
            .Where(m => m.ReferenceType == InvoiceReference
                        && m.ReferenceId == invoiceId
                        && m.MovementType == SaleMovement)
            .ToListAsync();

        foreach (var sale in sales)
        {
            var quantity = Math.Abs(sale.Quantity);

            var level = await _context.InventoryLevels
                .FirstOrDefaultAsync(l => l.ProductId == sale.ProductId && l.WarehouseId == sale.WarehouseId)
                ?? throw new BusinessException(
                    $"Inventory level not found for product {sale.ProductId} in warehouse {sale.WarehouseId}.");

            level.QuantityOnHand += quantity;
            level.QuantityReserved += quantity;
            level.LastMovement = DateTime.UtcNow;
            level.UpdatedBy = _currentUserService.UserId;

            _context.StockMovements.Add(new StockMovement
            {
                MovementType = ReservationMovement,
                ReferenceType = SalesOrderReference,
                ReferenceId = orderId,
                ProductId = sale.ProductId,
                WarehouseId = sale.WarehouseId,
                Quantity = quantity,
                MovementDate = DateTime.UtcNow,
                Notes = $"Reservation restored after invoice {invoiceId} cancellation",
                CreatedBy = _currentUserService.UserId,
            });

            _context.StockMovements.Add(new StockMovement
            {
                MovementType = SaleReversalMovement,
                ReferenceType = InvoiceReference,
                ReferenceId = invoiceId,
                ProductId = sale.ProductId,
                WarehouseId = sale.WarehouseId,
                Quantity = quantity,
                UnitCost = sale.UnitCost,
                TotalCost = sale.TotalCost,
                MovementDate = DateTime.UtcNow,
                Notes = $"Sale reversal for invoice {invoiceId}",
                CreatedBy = _currentUserService.UserId,
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task<List<NetReservation>> GetNetReservationsAsync(Guid orderId)
    {
        var movements = await _context.StockMovements
            .Where(m => m.ReferenceType == SalesOrderReference
                        && m.ReferenceId == orderId
                        && (m.MovementType == ReservationMovement || m.MovementType == ReleaseMovement))
            .ToListAsync();

        return movements
            .GroupBy(m => new { m.ProductId, m.WarehouseId })
            .Select(g => new NetReservation(g.Key.ProductId, g.Key.WarehouseId, g.Sum(m => m.Quantity)))
            .Where(r => r.Quantity > 0)
            .ToList();
    }
}
