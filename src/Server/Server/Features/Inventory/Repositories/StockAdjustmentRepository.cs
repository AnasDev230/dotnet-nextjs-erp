using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Inventory.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Repositories;

public class StockAdjustmentRepository : IStockAdjustmentRepository
{
    private readonly AppDbContext _context;

    public StockAdjustmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<StockAdjustmentResponse>> GetAllAsync(
        int page, int pageSize, Guid? productId, Guid? warehouseId)
    {
        var query = _context.StockAdjustments
            .AsNoTracking()
            .Include(a => a.Product)
            .Include(a => a.Warehouse)
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(a => a.ProductId == productId.Value);

        if (warehouseId.HasValue)
            query = query.Where(a => a.WarehouseId == warehouseId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new StockAdjustmentResponse
            {
                Id = a.Id,
                ProductName = a.Product!.Name,
                WarehouseName = a.Warehouse!.Name,
                CountedQty = a.CountedQty,
                SystemQty = a.SystemQty,
                Variance = a.CountedQty - a.SystemQty,
                Reason = a.Reason,
                CreatedAt = a.CreatedAt,
            })
            .ToListAsync();

        return new PagedResult<StockAdjustmentResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<StockAdjustment> AddAsync(StockAdjustment adjustment)
    {
        await _context.StockAdjustments.AddAsync(adjustment);
        return adjustment;
    }
}
