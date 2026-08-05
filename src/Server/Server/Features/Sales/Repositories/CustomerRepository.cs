using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<CustomerListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, CustomerStatus? status, CustomerType? type)
    {
        var query = _context.Customers
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(c =>
                c.Code.ToLower().Contains(term) ||
                c.Name.ToLower().Contains(term) ||
                (c.TaxNumber != null && c.TaxNumber.ToLower().Contains(term)));
        }

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        if (type.HasValue)
            query = query.Where(c => c.Type == type.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerListItemResponse
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Type = c.Type,
                CreditLimit = c.CreditLimit,
                Status = c.Status,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<CustomerListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<CustomerResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Customers
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CustomerResponse
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Type = c.Type,
                TaxNumber = c.TaxNumber,
                CreditLimit = c.CreditLimit,
                PaymentTerms = c.PaymentTerms,
                Status = c.Status,
                CreatedAt = c.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<CustomerListItemResponse>> GetAllForDropdownAsync()
    {
        return await _context.Customers
            .AsNoTracking()
            .Where(c => c.Status == CustomerStatus.Active)
            .OrderBy(c => c.Name)
            .Select(c => new CustomerListItemResponse
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Type = c.Type,
                CreditLimit = c.CreditLimit,
                Status = c.Status,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<Customer?> GetEntityByIdAsync(Guid id)
        => await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);

    public async Task<bool> ExistsByIdAsync(Guid id)
        => await _context.Customers.AnyAsync(c => c.Id == id);

    public async Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null)
    {
        if (excludeId.HasValue)
            return await _context.Customers.AnyAsync(c => c.Code == code && c.Id != excludeId.Value);
        return await _context.Customers.AnyAsync(c => c.Code == code);
    }

    public async Task<Customer> AddAsync(Customer customer)
    {
        await _context.Customers.AddAsync(customer);
        return customer;
    }

    public Task UpdateAsync(Customer customer)
    {
        _context.Customers.Update(customer);
        return Task.CompletedTask;
    }

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
        if (customer is not null)
        {
            customer.DeletedAt = DateTime.UtcNow;
            customer.UpdatedBy = userId;
        }
    }
}
