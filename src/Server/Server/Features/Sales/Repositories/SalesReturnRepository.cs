using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Sales.Entities;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Repositories;

public class SalesReturnRepository : ISalesReturnRepository
{
    private readonly AppDbContext _context;

    public SalesReturnRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<SalesReturnListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, ReturnStatus? status,
        DateTime? fromDate, DateTime? toDate)
    {
        var query = _context.SalesReturns
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(r =>
                r.ReturnNumber.ToLower().Contains(term) ||
                r.Invoice.InvoiceNumber.ToLower().Contains(term) ||
                r.Customer.Name.ToLower().Contains(term));
        }

        if (customerId.HasValue)
            query = query.Where(r => r.CustomerId == customerId.Value);

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
            .Select(r => new SalesReturnListItemResponse
            {
                Id = r.Id,
                ReturnNumber = r.ReturnNumber,
                InvoiceId = r.InvoiceId,
                InvoiceNumber = r.Invoice.InvoiceNumber,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.Name,
                WarehouseName = r.Warehouse.Name,
                ReturnDate = r.ReturnDate,
                TotalAmount = r.TotalAmount,
                Status = r.Status
            })
            .ToListAsync();

        return new PagedResult<SalesReturnListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<SalesReturnResponse?> GetByIdAsync(Guid id)
    {
        return await _context.SalesReturns
            .AsNoTracking()
            .Include(r => r.Invoice)
            .Include(r => r.Customer)
            .Include(r => r.Warehouse)
            .Include(r => r.Items)
            .ThenInclude(i => i.Product)
            .Where(r => r.Id == id)
            .Select(r => new SalesReturnResponse
            {
                Id = r.Id,
                ReturnNumber = r.ReturnNumber,
                InvoiceId = r.InvoiceId,
                InvoiceNumber = r.Invoice.InvoiceNumber,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.Name,
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
                Items = r.Items.Select(i => new SalesReturnItemResponse
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductSku = i.Product.Sku,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    LineTotal = i.LineTotal,
                    Reason = i.Reason
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<SalesReturn?> GetEntityByIdAsync(Guid id)
    {
        return await _context.SalesReturns
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<SalesReturn?> GetEntityWithItemsByIdAsync(Guid id)
    {
        return await _context.SalesReturns
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<string> GenerateReturnNumberAsync()
    {
        // Format: SRET-YYYY-XXXX (e.g., SRET-2026-0001)
        var year = DateTime.UtcNow.Year;
        var lastReturn = await _context.SalesReturns
            .AsNoTracking()
            .Where(r => r.ReturnNumber.StartsWith($"SRET-{year}-"))
            .OrderByDescending(r => r.ReturnNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastReturn != null)
        {
            var parts = lastReturn.ReturnNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"SRET-{year}-{nextNumber:D4}";
    }

    public async Task<List<SalesOrderItem>> GetOriginalOrderItemsAsync(Guid orderId)
    {
        return await _context.SalesOrderItems
            .AsNoTracking()
            .Where(i => i.OrderId == orderId)
            .ToListAsync();
    }

    public async Task<Dictionary<Guid, decimal>> GetReturnedQuantitiesAsync(Guid invoiceId)
    {
        var results = await _context.SalesReturnItems
            .AsNoTracking()
            .Where(i => i.SalesReturn.InvoiceId == invoiceId
                        && i.SalesReturn.Status == ReturnStatus.Completed)
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Total = g.Sum(x => x.Quantity) })
            .ToListAsync();

        return results.ToDictionary(r => r.ProductId, r => r.Total);
    }

    public async Task AddAsync(SalesReturn salesReturn)
    {
        await _context.SalesReturns.AddAsync(salesReturn);
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var salesReturn = await _context.SalesReturns
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (salesReturn is not null)
        {
            salesReturn.DeletedAt = DateTime.UtcNow;
            salesReturn.UpdatedBy = userId;

            foreach (var item in salesReturn.Items)
            {
                item.DeletedAt = DateTime.UtcNow;
                item.UpdatedBy = userId;
            }
        }
    }
}