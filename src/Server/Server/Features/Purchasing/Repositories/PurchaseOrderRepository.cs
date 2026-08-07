using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Repositories;

public class PurchaseOrderRepository : IPurchaseOrderRepository
{
    private readonly AppDbContext _context;

    public PurchaseOrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<PurchaseOrderListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? supplierId, PurchaseOrderStatus? status,
        DateOnly? fromDate, DateOnly? toDate)
    {
        var query = _context.PurchaseOrders
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(po =>
                po.PoNumber.ToLower().Contains(term) ||
                po.Supplier.Name.ToLower().Contains(term));
        }

        if (supplierId.HasValue)
            query = query.Where(po => po.SupplierId == supplierId.Value);

        if (status.HasValue)
            query = query.Where(po => po.Status == status.Value);

        if (fromDate.HasValue)
            query = query.Where(po => po.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(po => po.OrderDate <= toDate.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(po => po.OrderDate)
            .ThenByDescending(po => po.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(po => new PurchaseOrderListItemResponse
            {
                Id = po.Id,
                PoNumber = po.PoNumber,
                SupplierName = po.Supplier.Name,
                OrderDate = po.OrderDate,
                Status = po.Status,
                TotalAmount = po.TotalAmount,
                CreatedAt = po.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<PurchaseOrderListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PurchaseOrderResponse?> GetByIdAsync(Guid id)
    {
        return await _context.PurchaseOrders
            .AsNoTracking()
            .Include(po => po.Supplier)
            .Include(po => po.Items)
            .ThenInclude(i => i.Product)
            .Where(po => po.Id == id)
            .Select(po => new PurchaseOrderResponse
            {
                Id = po.Id,
                PoNumber = po.PoNumber,
                SupplierId = po.SupplierId,
                SupplierName = po.Supplier.Name,
                OrderDate = po.OrderDate,
                ExpectedDate = po.ExpectedDate,
                Status = po.Status,
                TotalAmount = po.TotalAmount,
                Currency = po.Currency,
                Terms = po.Terms,
                ApprovedBy = po.ApprovedBy,
                ApprovedByName = po.ApprovedBy != null
                    ? _context.Users.Where(u => u.Id == po.ApprovedBy).Select(u => u.FullName).FirstOrDefault()
                    : null,
                ApprovedAt = po.ApprovedAt,
                CreatedAt = po.CreatedAt,
                Items = po.Items.Select(i => new PoItemResponse
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductSku = i.Product.Sku,
                    Quantity = i.Quantity,
                    ReceivedQty = i.ReceivedQty,
                    RemainingQty = i.Quantity - i.ReceivedQty,
                    UnitPrice = i.UnitPrice,
                    LineTotal = i.LineTotal
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PurchaseOrder?> GetByIdWithItemsAsync(Guid id)
    {
        return await _context.PurchaseOrders
            .Include(po => po.Items)
            .FirstOrDefaultAsync(po => po.Id == id);
    }

    public async Task<string> GeneratePoNumberAsync()
    {
        // Format: PO-YYYY-XXXX (e.g., PO-2026-0001)
        var year = DateTime.UtcNow.Year;
        var lastPo = await _context.PurchaseOrders
            .AsNoTracking()
            .Where(po => po.PoNumber.StartsWith($"PO-{year}-"))
            .OrderByDescending(po => po.PoNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastPo != null)
        {
            var parts = lastPo.PoNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"PO-{year}-{nextNumber:D4}";
    }

    public async Task AddAsync(PurchaseOrder order)
    {
        await _context.PurchaseOrders.AddAsync(order);
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var order = await _context.PurchaseOrders
            .Include(po => po.Items)
            .FirstOrDefaultAsync(po => po.Id == id);

        if (order is not null)
        {
            order.DeletedAt = DateTime.UtcNow;
            order.UpdatedBy = userId;

            foreach (var item in order.Items)
            {
                item.DeletedAt = DateTime.UtcNow;
                item.UpdatedBy = userId;
            }
        }
    }
}
