using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Repositories;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly AppDbContext _context;

    public DepartmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<DepartmentListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, bool? isActive)
    {
        var query = _context.Departments
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(d =>
                d.Code.ToLower().Contains(term) ||
                d.Name.ToLower().Contains(term) ||
                (d.Description != null && d.Description.ToLower().Contains(term)));
        }

        if (isActive.HasValue)
            query = query.Where(d => d.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DepartmentListItemResponse
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                ParentName = d.Parent != null ? d.Parent.Name : null,
                ManagerName = d.Manager != null ? d.Manager.FirstName + " " + d.Manager.LastName : null,
                EmployeeCount = d.Employees.Count(e => e.DeletedAt == null),
                IsActive = d.IsActive
            })
            .ToListAsync();

        return new PagedResult<DepartmentListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<DepartmentResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Departments
            .AsNoTracking()
            .Where(d => d.Id == id)
            .Select(d => new DepartmentResponse
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                ParentId = d.ParentId,
                ParentName = d.Parent != null ? d.Parent.Name : null,
                ManagerId = d.ManagerId,
                ManagerName = d.Manager != null ? d.Manager.FirstName + " " + d.Manager.LastName : null,
                Description = d.Description,
                IsActive = d.IsActive,
                EmployeeCount = d.Employees.Count(e => e.DeletedAt == null),
                CreatedAt = d.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<Department?> GetEntityByIdAsync(Guid id)
        => await _context.Departments.FirstOrDefaultAsync(d => d.Id == id);

    public async Task<bool> ExistsByIdAsync(Guid id)
        => await _context.Departments.AnyAsync(d => d.Id == id);

    public async Task<string> GenerateCodeAsync()
    {
        var count = await _context.Departments.AsNoTracking().CountAsync();
        return $"DEPT-{(count + 1):000}";
    }

    public async Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null)
    {
        if (excludeId.HasValue)
            return await _context.Departments.AnyAsync(d => d.Name == name && d.Id != excludeId.Value);
        return await _context.Departments.AnyAsync(d => d.Name == name);
    }

    public async Task<List<DepartmentListItemResponse>> GetAllForDropdownAsync()
    {
        return await _context.Departments
            .AsNoTracking()
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentListItemResponse
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                ParentName = d.Parent != null ? d.Parent.Name : null,
                ManagerName = d.Manager != null ? d.Manager.FirstName + " " + d.Manager.LastName : null,
                EmployeeCount = d.Employees.Count(e => e.DeletedAt == null),
                IsActive = d.IsActive
            })
            .ToListAsync();
    }

    public async Task AddAsync(Department department)
        => await _context.Departments.AddAsync(department);

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == id);
        if (department is not null)
        {
            department.DeletedAt = DateTime.UtcNow;
            department.UpdatedBy = userId;
        }
    }

    public async Task<bool> HasEmployeesAsync(Guid departmentId)
        => await _context.Employees.AnyAsync(e => e.DepartmentId == departmentId);

    public async Task<bool> HasChildrenAsync(Guid departmentId)
        => await _context.Departments.AnyAsync(d => d.ParentId == departmentId);
}