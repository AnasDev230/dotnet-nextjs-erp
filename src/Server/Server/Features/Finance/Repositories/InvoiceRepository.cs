using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Finance.Enums;
using Server.Features.Finance.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Finance.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly AppDbContext _context;

    public InvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<InvoiceListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, InvoiceStatus? status,
        DateOnly? fromDate, DateOnly? toDate)
    {
        var query = _context.Invoices
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(i =>
                i.InvoiceNumber.ToLower().Contains(term) ||
                i.SalesOrder.OrderNumber.ToLower().Contains(term) ||
                i.Customer.Name.ToLower().Contains(term));
        }

        if (customerId.HasValue)
            query = query.Where(i => i.CustomerId == customerId.Value);

        if (status.HasValue)
            query = query.Where(i => i.Status == status.Value);

        if (fromDate.HasValue)
            query = query.Where(i => i.IssueDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(i => i.IssueDate <= toDate.Value);

        var totalCount = await query.CountAsync();

        // Overdue is calculated at read time: issued/partially-paid invoices
        // whose due date is before today.
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var items = await query
            .OrderByDescending(i => i.IssueDate)
            .ThenByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new InvoiceListItemResponse
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                OrderNumber = i.SalesOrder.OrderNumber,
                CustomerName = i.Customer.Name,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                NetAmount = i.NetAmount,
                PaidAmount = i.PaidAmount,
                Status = i.Status,
                IsOverdue = (i.Status == InvoiceStatus.Issued || i.Status == InvoiceStatus.PartiallyPaid)
                            && i.DueDate != null
                            && i.DueDate < today
            })
            .ToListAsync();

        return new PagedResult<InvoiceListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<Invoice?> GetByIdAsync(Guid id)
    {
        return await _context.Invoices
            .AsNoTracking()
            .Include(i => i.SalesOrder)
            .Include(i => i.Customer)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Invoice?> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.Invoices
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.OrderId == orderId);
    }

    public async Task<Invoice?> GetEntityByIdAsync(Guid id)
    {
        return await _context.Invoices
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<string> GenerateInvoiceNumberAsync()
    {
        // Format: INV-YYYY-XXXX (e.g., INV-2026-0001)
        var year = DateTime.UtcNow.Year;
        var lastInvoice = await _context.Invoices
            .AsNoTracking()
            .Where(i => i.InvoiceNumber.StartsWith($"INV-{year}-"))
            .OrderByDescending(i => i.InvoiceNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastInvoice != null)
        {
            var parts = lastInvoice.InvoiceNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"INV-{year}-{nextNumber:D4}";
    }

    public async Task AddAsync(Invoice invoice)
    {
        await _context.Invoices.AddAsync(invoice);
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice is not null)
        {
            invoice.DeletedAt = DateTime.UtcNow;
            invoice.UpdatedBy = userId;

            foreach (var payment in invoice.Payments)
            {
                payment.DeletedAt = DateTime.UtcNow;
                payment.UpdatedBy = userId;
            }
        }
    }
}
