using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Inventory.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<CategoryListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm)
    {
        var query = _context.Categories
            .AsNoTracking()
            .Include(c => c.Parent)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(c => c.Code.ToLower().Contains(term) || c.Name.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CategoryListItemResponse
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                ParentName = c.Parent != null ? c.Parent.Name : null,
                ProductsCount = c.Products.Count(p => p.DeletedAt == null),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<CategoryListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<CategoryResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Categories
            .AsNoTracking()
            .Include(c => c.Parent)
            .Include(c => c.Products)
            .Where(c => c.Id == id)
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                ParentId = c.ParentId,
                ParentName = c.Parent != null ? c.Parent.Name : null,
                ProductsCount = c.Products.Count(p => p.DeletedAt == null),
                CreatedAt = c.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<CategoryListItemResponse>> GetAllForDropdownAsync()
    {
        return await _context.Categories
            .AsNoTracking()
            .Include(c => c.Parent)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryListItemResponse
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                ParentName = c.Parent != null ? c.Parent.Name : null,
                ProductsCount = c.Products.Count(p => p.DeletedAt == null),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<Category?> GetEntityByIdAsync(Guid id)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null)
    {
        if (excludeId.HasValue)
            return await _context.Categories.AnyAsync(c => c.Code == code && c.Id != excludeId.Value);
        return await _context.Categories.AnyAsync(c => c.Code == code);
    }

    public async Task<bool> ExistsByIdAsync(Guid id)
    {
        return await _context.Categories.AnyAsync(c => c.Id == id);
    }

    public async Task<bool> HasSubCategoriesAsync(Guid id)
    {
        return await _context.Categories.AnyAsync(c => c.ParentId == id);
    }

    public async Task AddAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
    }

    public void Update(Category category)
    {
        _context.Categories.Update(category);
    }

    public void SoftDelete(Category category)
    {
        category.DeletedAt = DateTime.UtcNow;
    }
}
