using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Inventory.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Repositories;

public class WarehouseRepository : IWarehouseRepository
{
    private readonly AppDbContext _context;

    public WarehouseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<WarehouseListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, bool? isActive)
    {
        var query = _context.Warehouses
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(w =>
                w.Code.ToLower().Contains(term) ||
                w.Name.ToLower().Contains(term) ||
                (w.Location != null && w.Location.ToLower().Contains(term)));
        }

        if (isActive.HasValue)
            query = query.Where(w => w.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(w => w.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new WarehouseListItemResponse
            {
                Id = w.Id,
                Code = w.Code,
                Name = w.Name,
                Location = w.Location,
                IsActive = w.IsActive,
                CreatedAt = w.CreatedAt,
            })
            .ToListAsync();

        return new PagedResult<WarehouseListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<WarehouseResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Warehouses
            .AsNoTracking()
            .Where(w => w.Id == id)
            .Select(w => new WarehouseResponse
            {
                Id = w.Id,
                Code = w.Code,
                Name = w.Name,
                Location = w.Location,
                IsActive = w.IsActive,
                CreatedAt = w.CreatedAt,
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<WarehouseListItemResponse>> GetAllForDropdownAsync()
    {
        return await _context.Warehouses
            .AsNoTracking()
            .Where(w => w.IsActive)
            .OrderBy(w => w.Name)
            .Select(w => new WarehouseListItemResponse
            {
                Id = w.Id,
                Code = w.Code,
                Name = w.Name,
                Location = w.Location,
                IsActive = w.IsActive,
                CreatedAt = w.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<Warehouse?> GetEntityByIdAsync(Guid id)
        => await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == id);

    public async Task<bool> ExistsByIdAsync(Guid id)
        => await _context.Warehouses.AnyAsync(w => w.Id == id);

    public async Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null)
    {
        if (excludeId.HasValue)
            return await _context.Warehouses.AnyAsync(w => w.Code == code && w.Id != excludeId.Value);
        return await _context.Warehouses.AnyAsync(w => w.Code == code);
    }

    public async Task<Warehouse> AddAsync(Warehouse warehouse)
    {
        await _context.Warehouses.AddAsync(warehouse);
        return warehouse;
    }

    public void Update(Warehouse warehouse)
        => _context.Warehouses.Update(warehouse);

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var warehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == id);
        if (warehouse is not null)
        {
            warehouse.DeletedAt = DateTime.UtcNow;
            warehouse.UpdatedBy = userId;
        }
    }
}
