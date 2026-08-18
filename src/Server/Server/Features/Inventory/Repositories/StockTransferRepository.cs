using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Inventory.Entities;
using Server.Features.Inventory.Enums;
using Server.Features.Inventory.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Repositories;

public class StockTransferRepository : IStockTransferRepository
{
    private readonly AppDbContext _context;

    public StockTransferRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<StockTransferListItemResponse>> GetAllAsync(
        int page, int pageSize, StockTransferStatus? status = null)
    {
        var query = _context.StockTransfers
            .AsNoTracking()
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new StockTransferListItemResponse
            {
                Id = t.Id,
                TransferNumber = t.TransferNumber,
                FromWarehouseName = t.FromWarehouse.Name,
                ToWarehouseName = t.ToWarehouse.Name,
                ProductName = t.Product.Name,
                Quantity = t.Quantity,
                Status = t.Status,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<StockTransferListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<StockTransferResponse?> GetByIdAsync(Guid id)
    {
        return await _context.StockTransfers
            .AsNoTracking()
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Product)
            .Where(t => t.Id == id)
            .Select(t => new StockTransferResponse
            {
                Id = t.Id,
                TransferNumber = t.TransferNumber,
                FromWarehouseId = t.FromWarehouseId,
                FromWarehouseName = t.FromWarehouse.Name,
                ToWarehouseId = t.ToWarehouseId,
                ToWarehouseName = t.ToWarehouse.Name,
                ProductId = t.ProductId,
                ProductName = t.Product.Name,
                ProductSku = t.Product.Sku,
                Quantity = t.Quantity,
                Status = t.Status,
                ApprovedByName = t.ApprovedBy != null
                    ? _context.Users.Where(u => u.Id == t.ApprovedBy).Select(u => u.FullName).FirstOrDefault()
                    : null,
                ApprovedAt = t.ApprovedAt,
                CompletedAt = t.CompletedAt,
                Notes = t.Notes,
                CreatedAt = t.CreatedAt,
                CreatedByName = t.CreatedBy != null
                    ? _context.Users.Where(u => u.Id == t.CreatedBy).Select(u => u.FullName).FirstOrDefault()
                    : null
            })
            .FirstOrDefaultAsync();
    }

    public async Task<StockTransfer?> GetEntityByIdAsync(Guid id)
    {
        return await _context.StockTransfers
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Product)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task AddAsync(StockTransfer transfer)
    {
        await _context.StockTransfers.AddAsync(transfer);
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var transfer = await _context.StockTransfers
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transfer is not null)
        {
            transfer.DeletedAt = DateTime.UtcNow;
            transfer.UpdatedBy = userId;
        }
    }

    public async Task<string> GenerateTransferNumberAsync()
    {
        // Format: TRF-YYYY-XXXX (e.g., TRF-2026-0001)
        var year = DateTime.UtcNow.Year;
        var lastTransfer = await _context.StockTransfers
            .AsNoTracking()
            .Where(t => t.TransferNumber.StartsWith($"TRF-{year}-"))
            .OrderByDescending(t => t.TransferNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastTransfer != null)
        {
            var parts = lastTransfer.TransferNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"TRF-{year}-{nextNumber:D4}";
    }

    public async Task<bool> HasActiveTransferAsync(
        Guid productId, Guid fromWarehouseId, Guid toWarehouseId, Guid? excludeId = null)
    {
        return await _context.StockTransfers
            .AsNoTracking()
            .AnyAsync(t =>
                t.ProductId == productId &&
                t.FromWarehouseId == fromWarehouseId &&
                t.ToWarehouseId == toWarehouseId &&
                t.Status != StockTransferStatus.Completed &&
                t.Status != StockTransferStatus.Cancelled &&
                (!excludeId.HasValue || t.Id != excludeId.Value));
    }

    public async Task<decimal> GetAvailableStockAsync(Guid productId, Guid warehouseId)
    {
        var level = await _context.InventoryLevels
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.ProductId == productId && l.WarehouseId == warehouseId);

        return level is null ? 0 : level.QuantityAvailable;
    }
}
