using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Repositories;

public class SupplierInvoiceRepository : ISupplierInvoiceRepository
{
    private readonly AppDbContext _context;

    public SupplierInvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<SupplierInvoiceListItemResponse>> GetAllAsync(
        int page, int pageSize, SupplierInvoiceStatus? status, Guid? supplierId)
    {
        var query = _context.SupplierInvoices
            .AsNoTracking()
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(inv => inv.Status == status.Value);

        if (supplierId.HasValue)
            query = query.Where(inv => inv.SupplierId == supplierId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(inv => inv.IssueDate)
            .ThenByDescending(inv => inv.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(inv => new SupplierInvoiceListItemResponse
            {
                Id = inv.Id,
                InvoiceNumber = inv.InvoiceNumber,
                SupplierName = inv.Supplier.Name,
                PurchaseOrderNumber = inv.PurchaseOrder.PoNumber,
                IssueDate = inv.IssueDate,
                DueDate = inv.DueDate,
                NetAmount = inv.NetAmount,
                PaidAmount = inv.PaidAmount,
                Status = inv.Status
            })
            .ToListAsync();

        return new PagedResult<SupplierInvoiceListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<SupplierInvoiceResponse?> GetByIdAsync(Guid id)
    {
        return await _context.SupplierInvoices
            .AsNoTracking()
            .Include(inv => inv.Supplier)
            .Include(inv => inv.PurchaseOrder)
            .Where(inv => inv.Id == id)
            .Select(inv => new SupplierInvoiceResponse
            {
                Id = inv.Id,
                InvoiceNumber = inv.InvoiceNumber,
                PurchaseOrderId = inv.PurchaseOrderId,
                PurchaseOrderNumber = inv.PurchaseOrder.PoNumber,
                SupplierId = inv.SupplierId,
                SupplierName = inv.Supplier.Name,
                IssueDate = inv.IssueDate,
                DueDate = inv.DueDate,
                Subtotal = inv.Subtotal,
                TaxAmount = inv.TaxAmount,
                NetAmount = inv.NetAmount,
                PaidAmount = inv.PaidAmount,
                RemainingAmount = inv.NetAmount - inv.PaidAmount,
                Status = inv.Status,
                Notes = inv.Notes,
                SupplierReference = inv.SupplierReference,
                CreatedAt = inv.CreatedAt,
                Payments = inv.Payments
                    .OrderByDescending(p => p.PaymentDate)
                    .ThenByDescending(p => p.CreatedAt)
                    .Select(p => new PurchasePaymentResponse
                    {
                        Id = p.Id,
                        Amount = p.Amount,
                        Method = p.Method,
                        PaymentDate = p.PaymentDate,
                        Reference = p.Reference,
                        Notes = p.Notes
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<SupplierInvoice?> GetEntityByIdAsync(Guid id)
    {
        return await _context.SupplierInvoices
            .FirstOrDefaultAsync(inv => inv.Id == id);
    }

    public async Task<string> GenerateInvoiceNumberAsync()
    {
        // Format: SINV-YYYY-XXXX (e.g., SINV-2026-0001)
        var year = DateTime.UtcNow.Year;
        var lastInvoice = await _context.SupplierInvoices
            .AsNoTracking()
            .Where(inv => inv.InvoiceNumber.StartsWith($"SINV-{year}-"))
            .OrderByDescending(inv => inv.InvoiceNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastInvoice != null)
        {
            var parts = lastInvoice.InvoiceNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"SINV-{year}-{nextNumber:D4}";
    }

    public async Task AddAsync(SupplierInvoice invoice)
    {
        await _context.SupplierInvoices.AddAsync(invoice);
    }

    public async Task<bool> HasInvoiceForPurchaseOrderAsync(Guid purchaseOrderId, Guid? excludeId = null)
    {
        return await _context.SupplierInvoices
            .AsNoTracking()
            .AnyAsync(inv => inv.PurchaseOrderId == purchaseOrderId
                              && (!excludeId.HasValue || inv.Id != excludeId.Value));
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var invoice = await _context.SupplierInvoices
            .FirstOrDefaultAsync(inv => inv.Id == id);

        if (invoice is not null)
        {
            invoice.DeletedAt = DateTime.UtcNow;
            invoice.UpdatedBy = userId;
        }
    }
}