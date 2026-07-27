using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Inventory.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Repositories;

public class InventoryLevelRepository : IInventoryLevelRepository
{
    private readonly AppDbContext _context;

    public InventoryLevelRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<InventoryLevelListItemResponse>> GetAllAsync(
        int page, int pageSize, Guid? productId, Guid? warehouseId, bool? lowStockOnly)
    {
        var query = _context.InventoryLevels
            .AsNoTracking()
            .Include(l => l.Product)
            .Include(l => l.Warehouse)
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(l => l.ProductId == productId.Value);

        if (warehouseId.HasValue)
            query = query.Where(l => l.WarehouseId == warehouseId.Value);

        if (lowStockOnly.HasValue && lowStockOnly.Value)
            query = query.Where(l => l.QuantityOnHand <= l.Product.ReorderLevel);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(l => l.Product!.Name)
            .ThenBy(l => l.Warehouse!.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new InventoryLevelListItemResponse
            {
                Id = l.Id,
                ProductId = l.ProductId,
                ProductName = l.Product!.Name,
                ProductSku = l.Product.Sku,
                WarehouseId = l.WarehouseId,
                WarehouseName = l.Warehouse!.Name,
                QuantityOnHand = l.QuantityOnHand,
                QuantityReserved = l.QuantityReserved,
                QuantityAvailable = l.QuantityOnHand - l.QuantityReserved,
                ReorderLevel = l.Product.ReorderLevel,
                IsLowStock = l.QuantityOnHand <= l.Product.ReorderLevel,
                AvgCost = l.AvgCost,
                LastMovement = l.LastMovement,
            })
            .ToListAsync();

        return new PagedResult<InventoryLevelListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<InventoryLevelResponse?> GetByIdAsync(Guid id)
    {
        return await _context.InventoryLevels
            .AsNoTracking()
            .Include(l => l.Product)
            .Include(l => l.Warehouse)
            .Where(l => l.Id == id)
            .Select(l => new InventoryLevelResponse
            {
                Id = l.Id,
                ProductId = l.ProductId,
                ProductName = l.Product!.Name,
                ProductSku = l.Product.Sku,
                WarehouseId = l.WarehouseId,
                WarehouseName = l.Warehouse!.Name,
                QuantityOnHand = l.QuantityOnHand,
                QuantityReserved = l.QuantityReserved,
                QuantityAvailable = l.QuantityOnHand - l.QuantityReserved,
                ReorderLevel = l.Product.ReorderLevel,
                IsLowStock = l.QuantityOnHand <= l.Product.ReorderLevel,
                AvgCost = l.AvgCost,
                LastMovement = l.LastMovement,
            })
            .FirstOrDefaultAsync();
    }

    public async Task<InventoryLevel?> FindByProductAndWarehouseAsync(Guid productId, Guid warehouseId)
        => await _context.InventoryLevels
            .Include(l => l.Product)
            .Include(l => l.Warehouse)
            .FirstOrDefaultAsync(l => l.ProductId == productId && l.WarehouseId == warehouseId);

    public async Task<InventoryLevel> AddAsync(InventoryLevel level)
    {
        await _context.InventoryLevels.AddAsync(level);
        return level;
    }

    public void Update(InventoryLevel level)
        => _context.InventoryLevels.Update(level);
}
