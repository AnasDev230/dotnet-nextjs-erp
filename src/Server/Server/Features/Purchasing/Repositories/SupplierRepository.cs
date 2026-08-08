using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Repositories;

public class SupplierRepository : ISupplierRepository
{
    private readonly AppDbContext _context;

    public SupplierRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<SupplierListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, SupplierStatus? status)
    {
        var query = _context.Suppliers
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(s =>
                s.Code.ToLower().Contains(term) ||
                s.Name.ToLower().Contains(term) ||
                (s.Email != null && s.Email.ToLower().Contains(term)));
        }

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SupplierListItemResponse
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                ContactPerson = s.ContactPerson,
                Phone = s.Phone,
                PaymentTerms = s.PaymentTerms,
                Rating = s.Rating,
                Status = s.Status
            })
            .ToListAsync();

        return new PagedResult<SupplierListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<Supplier?> GetByIdAsync(Guid id)
        => await _context.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<Supplier?> GetEntityByIdAsync(Guid id)
        => await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id);

    public async Task<List<SupplierListItemResponse>> GetForDropdownAsync()
        => await _context.Suppliers
            .AsNoTracking()
            .Where(s => s.Status == SupplierStatus.Active)
            .OrderBy(s => s.Name)
            .Select(s => new SupplierListItemResponse
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                ContactPerson = s.ContactPerson,
                Phone = s.Phone,
                PaymentTerms = s.PaymentTerms,
                Rating = s.Rating,
                Status = s.Status
            })
            .ToListAsync();

    public async Task<string> GenerateCodeAsync()
    {
        var count = await _context.Suppliers.CountAsync();
        return $"SUP-{(count + 1):D3}";
    }

    public async Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null)
    {
        var normalized = name.Trim().ToLower();

        if (excludeId.HasValue)
            return await _context.Suppliers.AnyAsync(s =>
                s.Name.ToLower() == normalized && s.Id != excludeId.Value);

        return await _context.Suppliers.AnyAsync(s => s.Name.ToLower() == normalized);
    }

    public async Task AddAsync(Supplier supplier)
    {
        await _context.Suppliers.AddAsync(supplier);
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id);
        if (supplier is not null)
        {
            supplier.DeletedAt = DateTime.UtcNow;
            supplier.UpdatedBy = userId;
        }
    }

    public async Task<bool> HasUnfulfilledOrdersAsync(Guid supplierId)
        => await _context.PurchaseOrders.AnyAsync(po =>
            po.SupplierId == supplierId &&
            (po.Status == PurchaseOrderStatus.Approved ||
             po.Status == PurchaseOrderStatus.PartiallyReceived));
}
