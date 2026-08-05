using Microsoft.EntityFrameworkCore;
using Server.Features.Dashboard.Models;
using Server.Features.Finance;
using Server.Features.Finance.Enums;
using Server.Features.Sales;
using Server.Features.Sales.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.Dashboard.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _context;

    public DashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsResponse> GetStatsAsync()
    {
        // Invoices that are not cancelled count towards the invoiced totals.
        var nonCancelledInvoices = _context.Invoices.AsNoTracking()
            .Where(i => i.Status != InvoiceStatus.Cancelled);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var stats = new DashboardStatsResponse
        {
            // Sales — only confirmed orders count as sales
            TotalSalesAmount = await _context.SalesOrders.AsNoTracking()
                .Where(o => o.Status == SalesOrderStatus.Confirmed)
                .SumAsync(o => o.NetAmount),
            TotalSalesCount = await _context.SalesOrders.AsNoTracking()
                .CountAsync(o => o.Status == SalesOrderStatus.Confirmed),

            // Invoices
            TotalInvoicesAmount = await nonCancelledInvoices.SumAsync(i => i.NetAmount),
            TotalInvoicesCount = await nonCancelledInvoices.CountAsync(),

            // Payments — collected amount snapshot on every non-cancelled invoice
            TotalPaidAmount = await nonCancelledInvoices.SumAsync(i => i.PaidAmount),

            // Outstanding — invoices that are neither fully paid nor cancelled
            TotalOutstandingAmount = await _context.Invoices.AsNoTracking()
                .Where(i => i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Cancelled)
                .SumAsync(i => i.NetAmount - i.PaidAmount),

            // Overdue — issued/partially-paid invoices past their due date
            OverdueInvoicesCount = await _context.Invoices.AsNoTracking()
                .Where(i => (i.Status == InvoiceStatus.Issued || i.Status == InvoiceStatus.PartiallyPaid)
                            && i.DueDate != null
                            && i.DueDate < today)
                .CountAsync(),

            // Inventory — low stock means quantity at/below reorder level and a level is configured
            LowStockCount = await _context.InventoryLevels.AsNoTracking()
                .CountAsync(l => l.Product.ReorderLevel > 0 && l.QuantityOnHand <= l.Product.ReorderLevel),
            TotalProductsCount = await _context.Products.AsNoTracking().CountAsync(),

            // Customers
            TotalCustomersCount = await _context.Customers.AsNoTracking().CountAsync()
        };

        return stats;
    }

    public async Task<List<RecentOrderResponse>> GetRecentOrdersAsync(int count)
    {
        return await _context.SalesOrders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Take(count)
            .Select(o => new RecentOrderResponse
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.Customer.Name,
                OrderDate = o.OrderDate,
                NetAmount = o.NetAmount,
                Status = o.Status
            })
            .ToListAsync();
    }

    public async Task<List<RecentInvoiceResponse>> GetRecentInvoicesAsync(int count)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return await _context.Invoices
            .AsNoTracking()
            .OrderByDescending(i => i.CreatedAt)
            .Take(count)
            .Select(i => new RecentInvoiceResponse
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                CustomerName = i.Customer.Name,
                IssueDate = i.IssueDate,
                NetAmount = i.NetAmount,
                PaidAmount = i.PaidAmount,
                Status = i.Status,
                IsOverdue = (i.Status == InvoiceStatus.Issued || i.Status == InvoiceStatus.PartiallyPaid)
                            && i.DueDate != null
                            && i.DueDate < today
            })
            .ToListAsync();
    }

    public async Task<List<LowStockItemResponse>> GetLowStockItemsAsync(int count)
    {
        return await _context.InventoryLevels
            .AsNoTracking()
            .Where(l => l.Product.ReorderLevel > 0 && l.QuantityOnHand <= l.Product.ReorderLevel)
            // Most critical first: the smaller the coverage ratio, the worse it is
            .OrderBy(l => l.QuantityOnHand / l.Product.ReorderLevel)
            .ThenBy(l => l.Product.Name)
            .Take(count)
            .Select(l => new LowStockItemResponse
            {
                ProductId = l.ProductId,
                ProductName = l.Product.Name,
                Sku = l.Product.Sku,
                WarehouseName = l.Warehouse.Name,
                QuantityOnHand = l.QuantityOnHand,
                ReorderLevel = l.Product.ReorderLevel
            })
            .ToListAsync();
    }
}
