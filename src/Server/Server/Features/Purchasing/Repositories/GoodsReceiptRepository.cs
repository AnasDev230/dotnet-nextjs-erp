using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Repositories;

public class GoodsReceiptRepository : IGoodsReceiptRepository
{
    private readonly AppDbContext _context;

    public GoodsReceiptRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<GoodsReceiptListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? purchaseOrderId, DateOnly? fromDate, DateOnly? toDate)
    {
        var query = _context.GoodsReceipts
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(gr =>
                gr.GrnNumber.ToLower().Contains(term) ||
                gr.PurchaseOrder.PoNumber.ToLower().Contains(term) ||
                gr.PurchaseOrder.Supplier.Name.ToLower().Contains(term));
        }

        if (purchaseOrderId.HasValue)
            query = query.Where(gr => gr.PurchaseOrderId == purchaseOrderId.Value);

        if (fromDate.HasValue)
            query = query.Where(gr => gr.ReceiptDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(gr => gr.ReceiptDate <= toDate.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(gr => gr.ReceiptDate)
            .ThenByDescending(gr => gr.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(gr => new GoodsReceiptListItemResponse
            {
                Id = gr.Id,
                GrnNumber = gr.GrnNumber,
                PoNumber = gr.PurchaseOrder.PoNumber,
                SupplierName = gr.PurchaseOrder.Supplier.Name,
                ReceiptDate = gr.ReceiptDate,
                WarehouseName = gr.Warehouse.Name,
                Status = gr.Status
            })
            .ToListAsync();

        return new PagedResult<GoodsReceiptListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<GoodsReceiptResponse?> GetByIdAsync(Guid id)
    {
        return await _context.GoodsReceipts
            .AsNoTracking()
            .Include(gr => gr.PurchaseOrder)
            .ThenInclude(po => po.Supplier)
            .Include(gr => gr.Warehouse)
            .Include(gr => gr.Items)
            .ThenInclude(i => i.Product)
            .Where(gr => gr.Id == id)
            .Select(gr => new GoodsReceiptResponse
            {
                Id = gr.Id,
                GrnNumber = gr.GrnNumber,
                PurchaseOrderId = gr.PurchaseOrderId,
                PoNumber = gr.PurchaseOrder.PoNumber,
                SupplierName = gr.PurchaseOrder.Supplier.Name,
                ReceiptDate = gr.ReceiptDate,
                WarehouseId = gr.WarehouseId,
                WarehouseName = gr.Warehouse.Name,
                Status = gr.Status,
                Notes = gr.Notes,
                CreatedAt = gr.CreatedAt,
                Items = gr.Items.Select(i => new GrnItemResponse
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductSku = i.Product.Sku,
                    Quantity = i.Quantity
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<GoodsReceipt?> GetByIdWithItemsAsync(Guid id)
    {
        return await _context.GoodsReceipts
            .Include(gr => gr.Items)
            .FirstOrDefaultAsync(gr => gr.Id == id);
    }

    public async Task<string> GenerateGrnNumberAsync()
    {
        // Format: GRN-YYYY-XXXX (e.g., GRN-2026-0001)
        var year = DateTime.UtcNow.Year;
        var lastGrn = await _context.GoodsReceipts
            .AsNoTracking()
            .Where(gr => gr.GrnNumber.StartsWith($"GRN-{year}-"))
            .OrderByDescending(gr => gr.GrnNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastGrn != null)
        {
            var parts = lastGrn.GrnNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"GRN-{year}-{nextNumber:D4}";
    }

    public async Task AddAsync(GoodsReceipt receipt)
    {
        await _context.GoodsReceipts.AddAsync(receipt);
    }
}