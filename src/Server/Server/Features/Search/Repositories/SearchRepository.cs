using Microsoft.EntityFrameworkCore;
using Server.Features.HR.Enums;
using Server.Features.Inventory;
using Server.Features.Purchasing.Entities;
using Server.Features.Sales;
using Server.Features.Search.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Search.Repositories;

public class SearchRepository : ISearchRepository
{
    private readonly AppDbContext _context;
    public SearchRepository(AppDbContext context) => _context = context;

    public async Task<SearchResultResponse> SearchAsync(string query, int limitPerCategory = 5)
    {
        var employees = await _context.Employees.AsNoTracking()
            .Where(e => e.Status != EmployeeStatus.Terminated)
            .Where(e => e.FirstName.Contains(query) || e.LastName.Contains(query) || e.EmployeeNumber.Contains(query))
            .Take(limitPerCategory)
            .Select(e => new SearchResultItem
            {
                Id = e.Id,
                Title = e.FirstName + " " + e.LastName,
                Subtitle = e.JobTitle ?? "",
                Type = "employee",
            }).ToListAsync();

        var customers = await _context.Customers.AsNoTracking()
            .Where(c => c.Name.Contains(query) || c.Code.Contains(query))
            .Take(limitPerCategory)
            .Select(c => new SearchResultItem
            {
                Id = c.Id,
                Title = c.Name,
                Subtitle = c.Code,
                Type = "customer",
            }).ToListAsync();

        var suppliers = await _context.Suppliers.AsNoTracking()
            .Where(s => s.Name.Contains(query) || s.Code.Contains(query))
            .Take(limitPerCategory)
            .Select(s => new SearchResultItem
            {
                Id = s.Id,
                Title = s.Name,
                Subtitle = s.Code,
                Type = "supplier",
            }).ToListAsync();

        var products = await _context.Products.AsNoTracking()
            .Where(p => p.Name.Contains(query) || p.Sku.Contains(query))
            .Where(p => p.IsActive)
            .Take(limitPerCategory)
            .Select(p => new SearchResultItem
            {
                Id = p.Id,
                Title = p.Name,
                Subtitle = p.Sku,
                Type = "product",
            }).ToListAsync();

        var salesOrders = await _context.SalesOrders.AsNoTracking()
            .Where(o => o.OrderNumber.Contains(query))
            .Take(limitPerCategory)
            .Select(o => new SearchResultItem
            {
                Id = o.Id,
                Title = o.OrderNumber,
                Subtitle = o.Customer.Name,
                Type = "salesOrder",
            }).ToListAsync();

        var purchaseOrders = await _context.PurchaseOrders.AsNoTracking()
            .Where(o => o.PoNumber.Contains(query))
            .Take(limitPerCategory)
            .Select(o => new SearchResultItem
            {
                Id = o.Id,
                Title = o.PoNumber,
                Subtitle = o.Supplier.Name,
                Type = "purchaseOrder",
            }).ToListAsync();

        var invoices = await _context.Invoices.AsNoTracking()
            .Where(i => i.InvoiceNumber.Contains(query))
            .Take(limitPerCategory)
            .Select(i => new SearchResultItem
            {
                Id = i.Id,
                Title = i.InvoiceNumber,
                Subtitle = i.Customer.Name,
                Type = "invoice",
            }).ToListAsync();

        var departments = await _context.Departments.AsNoTracking()
            .Where(d => d.Name.Contains(query) || d.Code.Contains(query))
            .Where(d => d.IsActive)
            .Take(limitPerCategory)
            .Select(d => new SearchResultItem
            {
                Id = d.Id,
                Title = d.Name,
                Subtitle = d.Code,
                Type = "department",
            }).ToListAsync();

        var warehouses = await _context.Warehouses.AsNoTracking()
            .Where(w => w.Name.Contains(query) || w.Code.Contains(query))
            .Where(w => w.IsActive)
            .Take(limitPerCategory)
            .Select(w => new SearchResultItem
            {
                Id = w.Id,
                Title = w.Name,
                Subtitle = w.Code,
                Type = "warehouse",
            }).ToListAsync();

        return new SearchResultResponse
        {
            Employees = employees,
            Customers = customers,
            Suppliers = suppliers,
            Products = products,
            SalesOrders = salesOrders,
            PurchaseOrders = purchaseOrders,
            Invoices = invoices,
            Departments = departments,
            Warehouses = warehouses
        };
    }
}