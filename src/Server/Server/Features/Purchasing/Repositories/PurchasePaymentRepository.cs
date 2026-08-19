using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Repositories;

public class PurchasePaymentRepository : IPurchasePaymentRepository
{
    private readonly AppDbContext _context;

    public PurchasePaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<PurchasePaymentResponse>> GetAllAsync(
        int page, int pageSize, Guid? supplierInvoiceId)
    {
        var query = _context.PurchasePayments
            .AsNoTracking()
            .AsQueryable();

        if (supplierInvoiceId.HasValue)
            query = query.Where(p => p.SupplierInvoiceId == supplierInvoiceId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PurchasePaymentResponse
            {
                Id = p.Id,
                Amount = p.Amount,
                Method = p.Method,
                PaymentDate = p.PaymentDate,
                Reference = p.Reference,
                Notes = p.Notes
            })
            .ToListAsync();

        return new PagedResult<PurchasePaymentResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PurchasePayment?> GetByIdAsync(Guid id)
    {
        return await _context.PurchasePayments
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(PurchasePayment payment)
    {
        await _context.PurchasePayments.AddAsync(payment);
    }

    public async Task<decimal> GetTotalPaidAsync(Guid supplierInvoiceId)
    {
        return await _context.PurchasePayments
            .AsNoTracking()
            .Where(p => p.SupplierInvoiceId == supplierInvoiceId)
            .SumAsync(p => p.Amount);
    }
}