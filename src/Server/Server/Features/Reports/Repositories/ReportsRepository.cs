using Microsoft.EntityFrameworkCore;
using Server.Features.Finance.Enums;
using Server.Features.HR.Enums;
using Server.Features.Inventory;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Reports.Models;
using Server.Features.Sales.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.Reports.Repositories;

public class ReportsRepository : IReportsRepository
{
    private readonly AppDbContext _context;

    public ReportsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SalesSummaryResponse> GetSalesSummaryAsync(ReportQueryParams queryParams)
    {
        var fromDate = queryParams.FromDate;
        var toDate = queryParams.ToDate;
        var entityId = queryParams.EntityId;

        var confirmedOrders = _context.SalesOrders
            .AsNoTracking()
            .Where(o => o.Status == SalesOrderStatus.Confirmed);

        confirmedOrders = ApplyDateFilter(confirmedOrders, o => o.OrderDate, fromDate, toDate);

        if (entityId.HasValue)
            confirmedOrders = confirmedOrders.Where(o => o.CustomerId == entityId.Value);

        var totalRevenue = await confirmedOrders.SumAsync(o => o.NetAmount);
        var totalOrders = await confirmedOrders.CountAsync();

        var byPeriod = await confirmedOrders
            .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
            .Select(g => new SalesByPeriodItem
            {
                Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                Revenue = g.Sum(o => o.NetAmount),
                OrderCount = g.Count()
            })
            .OrderBy(x => x.Period)
            .ToListAsync();

        var topCustomers = await confirmedOrders
            .GroupBy(o => new { o.CustomerId, o.Customer.Name })
            .Select(g => new TopCustomerItem
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.Name,
                TotalAmount = g.Sum(o => o.NetAmount),
                OrderCount = g.Count()
            })
            .OrderByDescending(x => x.TotalAmount)
            .Take(10)
            .ToListAsync();

        var distinctCustomerIds = await confirmedOrders
            .Select(o => o.CustomerId)
            .Distinct()
            .ToListAsync();

        return new SalesSummaryResponse
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0m,
            TotalCustomers = distinctCustomerIds.Count,
            ByPeriod = byPeriod,
            TopCustomers = topCustomers
        };
    }

    public async Task<PurchasesSummaryResponse> GetPurchasesSummaryAsync(ReportQueryParams queryParams)
    {
        var fromDate = queryParams.FromDate;
        var toDate = queryParams.ToDate;
        var entityId = queryParams.EntityId;

        var validStatuses = new[]
        {
            PurchaseOrderStatus.Approved,
            PurchaseOrderStatus.PartiallyReceived,
            PurchaseOrderStatus.Received
        };

        var validOrders = _context.PurchaseOrders
            .AsNoTracking()
            .Where(o => validStatuses.Contains(o.Status));

        validOrders = ApplyDateFilter(validOrders, o => o.OrderDate, fromDate, toDate);

        if (entityId.HasValue)
            validOrders = validOrders.Where(o => o.SupplierId == entityId.Value);

        var totalSpending = await validOrders.SumAsync(o => o.TotalAmount);
        var totalOrders = await validOrders.CountAsync();

        var byPeriod = await validOrders
            .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
            .Select(g => new PurchasesByPeriodItem
            {
                Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                Spending = g.Sum(o => o.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderBy(x => x.Period)
            .ToListAsync();

        var topSuppliers = await validOrders
            .GroupBy(o => new { o.SupplierId, o.Supplier.Name })
            .Select(g => new TopSupplierItem
            {
                SupplierId = g.Key.SupplierId,
                SupplierName = g.Key.Name,
                TotalAmount = g.Sum(o => o.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderByDescending(x => x.TotalAmount)
            .Take(10)
            .ToListAsync();

        var activeSupplierIds = await validOrders
            .Select(o => o.SupplierId)
            .Distinct()
            .ToListAsync();

        return new PurchasesSummaryResponse
        {
            TotalSpending = totalSpending,
            TotalOrders = totalOrders,
            AverageOrderValue = totalOrders > 0 ? totalSpending / totalOrders : 0m,
            TotalSuppliers = activeSupplierIds.Count,
            ByPeriod = byPeriod,
            TopSuppliers = topSuppliers
        };
    }

    public async Task<InventorySummaryResponse> GetInventorySummaryAsync()
    {
        var totalProducts = await _context.Products.AsNoTracking().CountAsync();
        var totalWarehouses = await _context.Warehouses.AsNoTracking().CountAsync(w => w.IsActive);

        var totalInventoryValue = await _context.InventoryLevels
            .AsNoTracking()
            .SumAsync(l => l.QuantityOnHand * l.AvgCost);

        var lowStockCount = await _context.InventoryLevels
            .AsNoTracking()
            .CountAsync(l => l.Product.ReorderLevel > 0 && l.QuantityOnHand <= l.Product.ReorderLevel);

        var byWarehouse = await _context.InventoryLevels
            .AsNoTracking()
            .GroupBy(l => new { l.WarehouseId, l.Warehouse.Name })
            .Select(g => new StockByWarehouseItem
            {
                WarehouseId = g.Key.WarehouseId,
                WarehouseName = g.Key.Name,
                ProductCount = g.Count(),
                TotalValue = g.Sum(l => l.QuantityOnHand * l.AvgCost)
            })
            .OrderByDescending(x => x.ProductCount)
            .ToListAsync();

        var lowStockItems = await _context.InventoryLevels
            .AsNoTracking()
            .Where(l => l.Product.ReorderLevel > 0 && l.QuantityOnHand <= l.Product.ReorderLevel)
            .OrderBy(l => l.QuantityOnHand / l.Product.ReorderLevel)
            .ThenBy(l => l.Product.Name)
            .Take(20)
            .Select(l => new LowStockItem
            {
                ProductId = l.ProductId,
                ProductName = l.Product.Name,
                Sku = l.Product.Sku,
                WarehouseName = l.Warehouse.Name,
                QuantityOnHand = l.QuantityOnHand,
                ReorderLevel = l.Product.ReorderLevel
            })
            .ToListAsync();

        return new InventorySummaryResponse
        {
            TotalProducts = totalProducts,
            TotalWarehouses = totalWarehouses,
            TotalInventoryValue = totalInventoryValue,
            LowStockCount = lowStockCount,
            ByWarehouse = byWarehouse,
            LowStockItems = lowStockItems
        };
    }

    public async Task<CustomerStatementResponse> GetCustomerStatementAsync(Guid customerId)
    {
        var customer = await _context.Customers
            .AsNoTracking()
            .Where(c => c.Id == customerId)
            .Select(c => new { c.Id, c.Name, c.Code })
            .FirstOrDefaultAsync();

        if (customer is null)
            return new CustomerStatementResponse();

        var invoices = await _context.Invoices
            .AsNoTracking()
            .Where(i => i.CustomerId == customerId && i.Status != InvoiceStatus.Cancelled)
            .Select(i => new { i.IssueDate, i.InvoiceNumber, i.NetAmount })
            .ToListAsync();

        var payments = await _context.Payments
            .AsNoTracking()
            .Where(p => p.Invoice.CustomerId == customerId && p.Invoice.Status != InvoiceStatus.Cancelled)
            .Select(p => new { p.PaymentDate, p.Reference, p.Amount })
            .ToListAsync();

        var transactions = new List<StatementLineItem>();

        foreach (var invoice in invoices)
        {
            transactions.Add(new StatementLineItem
            {
                Date = invoice.IssueDate.ToDateTime(TimeOnly.MinValue),
                Type = "Invoice",
                Reference = invoice.InvoiceNumber,
                Debit = invoice.NetAmount,
                Credit = 0m,
                RunningBalance = 0m
            });
        }

        foreach (var payment in payments)
        {
            transactions.Add(new StatementLineItem
            {
                Date = payment.PaymentDate.ToDateTime(TimeOnly.MinValue),
                Type = "Payment",
                Reference = payment.Reference ?? string.Empty,
                Debit = 0m,
                Credit = payment.Amount,
                RunningBalance = 0m
            });
        }

        transactions = transactions
            .OrderBy(t => t.Date)
            .ToList();

        var runningBalance = 0m;
        foreach (var transaction in transactions)
        {
            runningBalance += transaction.Debit - transaction.Credit;
            transaction.RunningBalance = runningBalance;
        }

        var totalBilled = invoices.Sum(i => i.NetAmount);
        var totalPaid = payments.Sum(p => p.Amount);

        return new CustomerStatementResponse
        {
            CustomerId = customer.Id,
            CustomerName = customer.Name,
            CustomerCode = customer.Code,
            TotalBilled = totalBilled,
            TotalPaid = totalPaid,
            OutstandingBalance = totalBilled - totalPaid,
            Transactions = transactions
        };
    }

    public async Task<EmployeesSummaryResponse> GetEmployeesSummaryAsync()
    {
        var totalEmployees = await _context.Employees.AsNoTracking().CountAsync();
        var activeCount = await _context.Employees.AsNoTracking().CountAsync(e => e.Status == EmployeeStatus.Active);
        var onLeaveCount = await _context.Employees.AsNoTracking().CountAsync(e => e.Status == EmployeeStatus.OnLeave);
        var terminatedCount = await _context.Employees.AsNoTracking().CountAsync(e => e.Status == EmployeeStatus.Terminated);

        var totalSalaries = await _context.Employees.AsNoTracking().SumAsync(e => e.Salary);

        var byDepartment = await _context.Employees
            .AsNoTracking()
            .GroupBy(e => new { e.DepartmentId, e.Department!.Name })
            .Select(g => new
            {
                g.Key.DepartmentId,
                g.Key.Name,
                EmployeeCount = g.Count(),
                TotalSalaries = g.Sum(e => e.Salary)
            })
            .OrderByDescending(x => x.EmployeeCount)
            .ToListAsync();

        return new EmployeesSummaryResponse
        {
            TotalEmployees = totalEmployees,
            ActiveCount = activeCount,
            OnLeaveCount = onLeaveCount,
            TerminatedCount = terminatedCount,
            TotalSalaries = totalSalaries,
            ByDepartment = byDepartment
                .Select(x => new EmployeesByDepartmentItem
                {
                    DepartmentId = x.DepartmentId,
                    DepartmentName = x.Name ?? "بدون قسم",
                    EmployeeCount = x.EmployeeCount,
                    TotalSalaries = x.TotalSalaries
                })
                .ToList()
        };
    }

    private static IQueryable<T> ApplyDateFilter<T>(
        IQueryable<T> query,
        Func<T, DateOnly> dateSelector,
        DateOnly? fromDate,
        DateOnly? toDate)
    {
        if (fromDate.HasValue)
            query = query.Where(e => dateSelector(e) >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(e => dateSelector(e) <= toDate.Value);

        return query;
    }
}