using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Sales.Entities;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Repositories;

public class QuotationRepository : IQuotationRepository
{
    private readonly AppDbContext _context;

    public QuotationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<QuotationListItemResponse>> GetAllAsync(
        int page, int pageSize, QuotationStatus? status = null, Guid? customerId = null)
    {
        var query = _context.Quotations
            .AsNoTracking()
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(q => q.Status == status.Value);

        if (customerId.HasValue)
            query = query.Where(q => q.CustomerId == customerId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(q => q.QuotationDate)
            .ThenByDescending(q => q.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(q => new QuotationListItemResponse
            {
                Id = q.Id,
                QuotationNumber = q.QuotationNumber,
                CustomerName = q.Customer.Name,
                QuotationDate = q.QuotationDate,
                ExpiryDate = q.ExpiryDate,
                NetAmount = q.NetAmount,
                Status = q.Status
            })
            .ToListAsync();

        return new PagedResult<QuotationListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<Quotation?> GetByIdAsync(Guid id)
    {
        return await _context.Quotations
            .AsNoTracking()
            .Include(q => q.Customer)
            .Include(q => q.Items).ThenInclude(i => i.Product)
            .Include(q => q.ConvertedSalesOrder)
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task<Quotation?> GetEntityByIdAsync(Guid id)
    {
        return await _context.Quotations
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task AddAsync(Quotation quotation)
    {
        await _context.Quotations.AddAsync(quotation);
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var quotation = await _context.Quotations
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quotation is not null)
        {
            quotation.DeletedAt = DateTime.UtcNow;
            quotation.UpdatedBy = userId;

            foreach (var item in quotation.Items)
            {
                item.DeletedAt = DateTime.UtcNow;
                item.UpdatedBy = userId;
            }
        }
    }

    public async Task HardDeleteAsync(Guid id)
    {
        var quotation = await _context.Quotations
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quotation is not null)
            _context.Quotations.Remove(quotation);
    }

    public async Task<string> GenerateQuotationNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var lastQuotation = await _context.Quotations
            .AsNoTracking()
            .Where(q => q.QuotationNumber.StartsWith($"QT-{year}-"))
            .OrderByDescending(q => q.QuotationNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastQuotation is not null)
        {
            var parts = lastQuotation.QuotationNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"QT-{year}-{nextNumber:D4}";
    }

    public async Task MarkExpiredAsync()
    {
        await _context.Quotations
            .Where(q => q.Status == QuotationStatus.Sent && q.ExpiryDate < DateTime.UtcNow)
            .ExecuteUpdateAsync(s => s
                .SetProperty(q => q.Status, QuotationStatus.Expired));
    }
}
