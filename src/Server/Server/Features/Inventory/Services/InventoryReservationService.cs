using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Common.Contracts;
using Server.Core.Exceptions;
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
    private const string ReservationMovement = "SalesReservation";
    private const string ReleaseMovement = "SalesRelease";

    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public InventoryReservationService(
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
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
        var reservations = await _context.StockMovements
            .Where(m => m.ReferenceType == SalesOrderReference
                        && m.ReferenceId == orderId
                        && m.MovementType == ReservationMovement)
            .ToListAsync();

        foreach (var reservation in reservations)
        {
            var level = await _context.InventoryLevels
                .FirstOrDefaultAsync(l => l.ProductId == reservation.ProductId && l.WarehouseId == reservation.WarehouseId);

            if (level is not null)
            {
                level.QuantityReserved = Math.Max(0, level.QuantityReserved - reservation.Quantity);
                level.LastMovement = DateTime.UtcNow;
                level.UpdatedBy = _currentUserService.UserId;
            }

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
}
