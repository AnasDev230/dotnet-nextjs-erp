using Microsoft.EntityFrameworkCore;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Repositories;

public class ProductSupplierRepository : IProductSupplierRepository
{
    private readonly AppDbContext _context;

    public ProductSupplierRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductSupplierListItemResponse>> GetByProductIdAsync(Guid productId)
        => await _context.ProductSuppliers
            .AsNoTracking()
            .Include(ps => ps.Product)
            .Include(ps => ps.Supplier)
            .Where(ps => ps.ProductId == productId)
            .OrderByDescending(ps => ps.IsPrimary)
            .ThenByDescending(ps => ps.CreatedAt)
            .Select(ps => new ProductSupplierListItemResponse
            {
                Id = ps.Id,
                ProductId = ps.ProductId,
                ProductName = ps.Product.Name,
                ProductSku = ps.Product.Sku,
                SupplierId = ps.SupplierId,
                SupplierName = ps.Supplier.Name,
                SupplierCode = ps.Supplier.Code,
                SupplierSku = ps.SupplierSku,
                LeadTimeDays = ps.LeadTimeDays,
                UnitCost = ps.UnitCost,
                IsPrimary = ps.IsPrimary
            })
            .ToListAsync();

    public async Task<List<ProductSupplierListItemResponse>> GetBySupplierIdAsync(Guid supplierId)
        => await _context.ProductSuppliers
            .AsNoTracking()
            .Include(ps => ps.Product)
            .Include(ps => ps.Supplier)
            .Where(ps => ps.SupplierId == supplierId)
            .OrderByDescending(ps => ps.CreatedAt)
            .Select(ps => new ProductSupplierListItemResponse
            {
                Id = ps.Id,
                ProductId = ps.ProductId,
                ProductName = ps.Product.Name,
                ProductSku = ps.Product.Sku,
                SupplierId = ps.SupplierId,
                SupplierName = ps.Supplier.Name,
                SupplierCode = ps.Supplier.Code,
                SupplierSku = ps.SupplierSku,
                LeadTimeDays = ps.LeadTimeDays,
                UnitCost = ps.UnitCost,
                IsPrimary = ps.IsPrimary
            })
            .ToListAsync();

    public async Task<ProductSupplierResponse?> GetByIdAsync(Guid id)
        => await _context.ProductSuppliers
            .AsNoTracking()
            .Include(ps => ps.Product)
            .Include(ps => ps.Supplier)
            .Where(ps => ps.Id == id)
            .Select(ps => new ProductSupplierResponse
            {
                Id = ps.Id,
                ProductId = ps.ProductId,
                ProductName = ps.Product.Name,
                ProductSku = ps.Product.Sku,
                SupplierId = ps.SupplierId,
                SupplierName = ps.Supplier.Name,
                SupplierCode = ps.Supplier.Code,
                SupplierSku = ps.SupplierSku,
                LeadTimeDays = ps.LeadTimeDays,
                MinOrderQty = ps.MinOrderQty,
                UnitCost = ps.UnitCost,
                IsPrimary = ps.IsPrimary,
                CreatedAt = ps.CreatedAt
            })
            .FirstOrDefaultAsync();

    public async Task<ProductSupplier?> GetEntityByIdAsync(Guid id)
        => await _context.ProductSuppliers
            .FirstOrDefaultAsync(ps => ps.Id == id);

    public async Task<bool> ExistsAsync(Guid productId, Guid supplierId, Guid? excludeId = null)
    {
        if (excludeId.HasValue)
            return await _context.ProductSuppliers.AnyAsync(ps =>
                ps.ProductId == productId && ps.SupplierId == supplierId && ps.Id != excludeId.Value);

        return await _context.ProductSuppliers.AnyAsync(ps =>
            ps.ProductId == productId && ps.SupplierId == supplierId);
    }

    public async Task AddAsync(ProductSupplier productSupplier)
    {
        await _context.ProductSuppliers.AddAsync(productSupplier);
    }

    public async Task UnsetPrimaryAsync(Guid productId, Guid excludeId)
    {
        var others = await _context.ProductSuppliers
            .Where(ps => ps.ProductId == productId && ps.Id != excludeId && ps.IsPrimary)
            .ToListAsync();

        foreach (var other in others)
            other.IsPrimary = false;
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var link = await _context.ProductSuppliers.FirstOrDefaultAsync(ps => ps.Id == id);
        if (link is not null)
        {
            link.DeletedAt = DateTime.UtcNow;
            link.UpdatedBy = userId;
        }
    }
}