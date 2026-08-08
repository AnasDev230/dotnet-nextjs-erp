using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly AppDbContext _context;

    public EmployeeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<EmployeeListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, Guid? departmentId, EmployeeStatus? status)
    {
        var query = _context.Employees
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(e =>
                e.EmployeeNumber.ToLower().Contains(term) ||
                e.FirstName.ToLower().Contains(term) ||
                e.LastName.ToLower().Contains(term) ||
                (e.FirstName + " " + e.LastName).ToLower().Contains(term) ||
                (e.Email != null && e.Email.ToLower().Contains(term)));
        }

        if (departmentId.HasValue)
            query = query.Where(e => e.DepartmentId == departmentId.Value);

        if (status.HasValue)
            query = query.Where(e => e.Status == status.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EmployeeListItemResponse
            {
                Id = e.Id,
                EmployeeNumber = e.EmployeeNumber,
                FullName = e.FirstName + " " + e.LastName,
                DepartmentName = e.Department != null ? e.Department.Name : null,
                JobTitle = e.JobTitle,
                Status = e.Status,
                HireDate = e.HireDate
            })
            .ToListAsync();

        return new PagedResult<EmployeeListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<EmployeeResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Employees
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(e => new EmployeeResponse
            {
                Id = e.Id,
                EmployeeNumber = e.EmployeeNumber,
                FirstName = e.FirstName,
                LastName = e.LastName,
                FullName = e.FirstName + " " + e.LastName,
                Email = e.Email,
                Phone = e.Phone,
                HireDate = e.HireDate,
                DepartmentId = e.DepartmentId,
                DepartmentName = e.Department != null ? e.Department.Name : null,
                JobTitle = e.JobTitle,
                EmploymentType = e.EmploymentType,
                Salary = e.Salary,
                Currency = e.Currency,
                ManagerId = e.ManagerId,
                ManagerName = e.Manager != null ? e.Manager.FirstName + " " + e.Manager.LastName : null,
                Status = e.Status,
                UserId = e.UserId,
                UserName = e.User != null ? e.User.UserName : null,
                Notes = e.Notes,
                CreatedAt = e.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<Employee?> GetEntityByIdAsync(Guid id)
        => await _context.Employees.FirstOrDefaultAsync(e => e.Id == id);

    public async Task<bool> ExistsByIdAsync(Guid id)
        => await _context.Employees.AnyAsync(e => e.Id == id);

    public async Task<string> GenerateEmployeeNumberAsync()
    {
        var count = await _context.Employees.AsNoTracking().CountAsync();
        return $"EMP-{(count + 1):000}";
    }

    public async Task<bool> IsEmailAsync(string email, Guid? excludeId = null)
    {
        var normalized = email.Trim().ToLower();
        if (excludeId.HasValue)
            return await _context.Employees.AnyAsync(e => e.Email != null && e.Email.ToLower() == normalized && e.Id != excludeId.Value);
        return await _context.Employees.AnyAsync(e => e.Email != null && e.Email.ToLower() == normalized);
    }

    public async Task<List<EmployeeListItemResponse>> GetAllForDropdownAsync()
    {
        return await _context.Employees
            .AsNoTracking()
            .Where(e => e.Status == EmployeeStatus.Active)
            .OrderBy(e => e.FirstName)
            .Select(e => new EmployeeListItemResponse
            {
                Id = e.Id,
                EmployeeNumber = e.EmployeeNumber,
                FullName = e.FirstName + " " + e.LastName,
                DepartmentName = e.Department != null ? e.Department.Name : null,
                JobTitle = e.JobTitle,
                Status = e.Status,
                HireDate = e.HireDate
            })
            .ToListAsync();
    }

    public async Task AddAsync(Employee employee)
        => await _context.Employees.AddAsync(employee);

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id);
        if (employee is not null)
        {
            employee.DeletedAt = DateTime.UtcNow;
            employee.UpdatedBy = userId;
        }
    }

    public async Task<bool> DepartmentIdExistsAsync(Guid departmentId)
        => await _context.Departments.AnyAsync(d => d.Id == departmentId);

    public async Task<bool> UserIdExistsAsync(Guid userId)
        => await _context.Users.AnyAsync(u => u.Id == userId);

    public async Task<bool> IsUserIdLinkedAsync(Guid userId, Guid? excludeEmployeeId = null)
    {
        if (excludeEmployeeId.HasValue)
            return await _context.Employees.AnyAsync(e => e.UserId == userId && e.Id != excludeEmployeeId.Value);
        return await _context.Employees.AnyAsync(e => e.UserId == userId);
    }

    public async Task<bool> IsManagerOfOthersAsync(Guid employeeId)
        => await _context.Employees.AnyAsync(e => e.ManagerId == employeeId);

    public async Task<bool> IsDepartmentManagerAsync(Guid employeeId)
        => await _context.Departments.AnyAsync(d => d.ManagerId == employeeId);
}