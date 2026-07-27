using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Inventory.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, Guid? categoryId, bool? isActive)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(p => p.Sku.ToLower().Contains(term) || p.Name.ToLower().Contains(term));
        }

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductListItemResponse
            {
                Id = p.Id,
                Sku = p.Sku,
                Name = p.Name,
                CategoryName = p.Category != null ? p.Category.Name : null,
                UnitOfMeasure = p.UnitOfMeasure,
                ReorderLevel = p.ReorderLevel,
                SalePrice = p.SalePrice,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<ProductListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.Id == id)
            .Select(p => new ProductResponse
            {
                Id = p.Id,
                Sku = p.Sku,
                Name = p.Name,
                Description = p.Description,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : null,
                UnitOfMeasure = p.UnitOfMeasure,
                ReorderLevel = p.ReorderLevel,
                ReorderQty = p.ReorderQty,
                SalePrice = p.SalePrice,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<Product?> GetEntityByIdAsync(Guid id)
    {
        return await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<bool> ExistsBySkuAsync(string sku, Guid? excludeId = null)
    {
        if (excludeId.HasValue)
            return await _context.Products.AnyAsync(p => p.Sku == sku && p.Id != excludeId.Value);
        return await _context.Products.AnyAsync(p => p.Sku == sku);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Products.AnyAsync(p => p.Id == id);
    }

    public async Task AddAsync(Product product)
    {
        await _context.Products.AddAsync(product);
    }

    public void Update(Product product)
    {
        _context.Products.Update(product);
    }

    public void SoftDelete(Product product)
    {
        product.DeletedAt = DateTime.UtcNow;
    }
}
