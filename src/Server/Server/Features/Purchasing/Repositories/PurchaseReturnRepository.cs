using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Models;
using Server.Features.Sales.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Repositories;

public class PurchaseReturnRepository : IPurchaseReturnRepository
{
    private readonly AppDbContext _context;

    public PurchaseReturnRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<PurchaseReturnListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? supplierId, ReturnStatus? status,
        DateTime? fromDate, DateTime? toDate)
    {
        var query = _context.PurchaseReturns
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(r =>
                r.ReturnNumber.ToLower().Contains(term) ||
                r.GoodsReceipt.GrnNumber.ToLower().Contains(term) ||
                r.GoodsReceipt.PurchaseOrder.Supplier.Name.ToLower().Contains(term));
        }

        if (supplierId.HasValue)
            query = query.Where(r => r.SupplierId == supplierId.Value);

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        if (fromDate.HasValue)
            query = query.Where(r => r.ReturnDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(r => r.ReturnDate <= toDate.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.ReturnDate)
            .ThenByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new PurchaseReturnListItemResponse
            {
                Id = r.Id,
                ReturnNumber = r.ReturnNumber,
                GoodsReceiptId = r.GoodsReceiptId,
                GrnNumber = r.GoodsReceipt.GrnNumber,
                SupplierId = r.SupplierId,
                SupplierName = r.GoodsReceipt.PurchaseOrder.Supplier.Name,
                WarehouseName = r.Warehouse.Name,
                ReturnDate = r.ReturnDate,
                TotalAmount = r.TotalAmount,
                Status = r.Status
            })
            .ToListAsync();

        return new PagedResult<PurchaseReturnListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PurchaseReturnResponse?> GetByIdAsync(Guid id)
    {
        return await _context.PurchaseReturns
            .AsNoTracking()
            .Include(r => r.GoodsReceipt)
                .ThenInclude(gr => gr.PurchaseOrder)
                    .ThenInclude(po => po.Supplier)
            .Include(r => r.Warehouse)
            .Include(r => r.Items)
                .ThenInclude(i => i.Product)
            .Where(r => r.Id == id)
            .Select(r => new PurchaseReturnResponse
            {
                Id = r.Id,
                ReturnNumber = r.ReturnNumber,
                GoodsReceiptId = r.GoodsReceiptId,
                GrnNumber = r.GoodsReceipt.GrnNumber,
                SupplierId = r.SupplierId,
                SupplierName = r.GoodsReceipt.PurchaseOrder.Supplier.Name,
                WarehouseId = r.WarehouseId,
                WarehouseName = r.Warehouse.Name,
                Reason = r.Reason,
                ReturnDate = r.ReturnDate,
                TotalAmount = r.TotalAmount,
                Status = r.Status,
                ApprovedBy = r.ApprovedBy,
                ApprovedAt = r.ApprovedAt,
                CompletedAt = r.CompletedAt,
                CreatedAt = r.CreatedAt,
                Items = r.Items.Select(i => new PurchaseReturnItemResponse
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductSku = i.Product.Sku,
                    Quantity = i.Quantity,
                    UnitCost = i.UnitCost,
                    LineTotal = i.LineTotal,
                    Reason = i.Reason
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PurchaseReturn?> GetEntityByIdAsync(Guid id)
    {
        return await _context.PurchaseReturns
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<PurchaseReturn?> GetEntityWithItemsByIdAsync(Guid id)
    {
        return await _context.PurchaseReturns
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<string> GenerateReturnNumberAsync()
    {
        // Format: PRET-YYYY-XXXX (e.g., PRET-2026-0001)
        var year = DateTime.UtcNow.Year;
        var lastReturn = await _context.PurchaseReturns
            .AsNoTracking()
            .Where(r => r.ReturnNumber.StartsWith($"PRET-{year}-"))
            .OrderByDescending(r => r.ReturnNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastReturn != null)
        {
            var parts = lastReturn.ReturnNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"PRET-{year}-{nextNumber:D4}";
    }

    public async Task<GoodsReceipt?> GetGrnWithItemsAsync(Guid grnId)
    {
        return await _context.GoodsReceipts
            .Include(gr => gr.PurchaseOrder)
            .Include(gr => gr.Items)
                .ThenInclude(i => i.Product)
            .Include(gr => gr.Items)
                .ThenInclude(i => i.PoItem)
            .FirstOrDefaultAsync(gr => gr.Id == grnId);
    }

    public async Task<Dictionary<Guid, decimal>> GetReturnedQuantitiesAsync(Guid grnId)
    {
        var results = await _context.PurchaseReturnItems
            .AsNoTracking()
            .Where(i => i.PurchaseReturn.GoodsReceiptId == grnId
                        && i.PurchaseReturn.Status == ReturnStatus.Completed)
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Total = g.Sum(x => x.Quantity) })
            .ToListAsync();

        return results.ToDictionary(r => r.ProductId, r => r.Total);
    }

    public async Task AddAsync(PurchaseReturn purchaseReturn)
    {
        await _context.PurchaseReturns.AddAsync(purchaseReturn);
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var purchaseReturn = await _context.PurchaseReturns
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (purchaseReturn is not null)
        {
            purchaseReturn.DeletedAt = DateTime.UtcNow;
            purchaseReturn.UpdatedBy = userId;

            foreach (var item in purchaseReturn.Items)
            {
                item.DeletedAt = DateTime.UtcNow;
                item.UpdatedBy = userId;
            }
        }
    }
}