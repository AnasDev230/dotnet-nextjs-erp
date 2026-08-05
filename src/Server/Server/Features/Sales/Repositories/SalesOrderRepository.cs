using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Sales.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Repositories;

public class SalesOrderRepository : ISalesOrderRepository
{
    private readonly AppDbContext _context;

    public SalesOrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<SalesOrderListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, SalesOrderStatus? status,
        DateOnly? fromDate, DateOnly? toDate)
    {
        var query = _context.SalesOrders
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(term) ||
                o.Customer.Name.ToLower().Contains(term));
        }

        if (customerId.HasValue)
            query = query.Where(o => o.CustomerId == customerId.Value);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        if (fromDate.HasValue)
            query = query.Where(o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.OrderDate <= toDate.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.OrderDate)
            .ThenByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new SalesOrderListItemResponse
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.Customer.Name,
                OrderDate = o.OrderDate,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                NetAmount = o.NetAmount,
                ItemsCount = o.Items.Count
            })
            .ToListAsync();

        return new PagedResult<SalesOrderListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<SalesOrderResponse?> GetByIdAsync(Guid id)
    {
        return await _context.SalesOrders
            .AsNoTracking()
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .Include(o => o.TaxRate)
            .Where(o => o.Id == id)
            .Select(o => new SalesOrderResponse
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer.Name,
                OrderDate = o.OrderDate,
                DeliveryDate = o.DeliveryDate,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                Notes = o.Notes,
                DiscountPct = o.DiscountPct,
                DiscountAmount = o.DiscountAmount,
                TaxRateId = o.TaxRateId,
                TaxRateName = o.TaxRate != null ? o.TaxRate.Name : null,
                TaxPct = o.TaxPct,
                TaxAmount = o.TaxAmount,
                NetAmount = o.NetAmount,
                Subtotal = o.Items.Sum(i => i.LineTotal),
                CreatedAt = o.CreatedAt,
                Items = o.Items.Select(i => new SalesOrderItemResponse
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductSku = i.Product.Sku,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    DiscountPct = i.DiscountPct,
                    LineTotal = i.LineTotal
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<SalesOrder?> GetByIdWithItemsAsync(Guid id)
    {
        return await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<string> GenerateOrderNumberAsync()
    {
        // Format: SO-YYYY-XXXX (e.g., SO-2026-0001)
        var year = DateTime.UtcNow.Year;
        var lastOrder = await _context.SalesOrders
            .AsNoTracking()
            .Where(o => o.OrderNumber.StartsWith($"SO-{year}-"))
            .OrderByDescending(o => o.OrderNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastOrder != null)
        {
            var parts = lastOrder.OrderNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"SO-{year}-{nextNumber:D4}";
    }

    public async Task<SalesOrder> AddAsync(SalesOrder order)
    {
        await _context.SalesOrders.AddAsync(order);
        return order;
    }

   
    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

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
