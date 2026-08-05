using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;
using Server.Features.Sales.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Sales.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CustomerService(
        ICustomerRepository repository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<CustomerListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, CustomerStatus? status, CustomerType? type)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, status, type);

    public async Task<CustomerResponse> GetByIdAsync(Guid id)
    {
        var customer = await _repository.GetByIdAsync(id);
        if (customer is null) throw new NotFoundException(nameof(Customer), id);
        return customer;
    }

    public async Task<List<CustomerListItemResponse>> GetAllForDropdownAsync()
        => await _repository.GetAllForDropdownAsync();

    public async Task<CustomerResponse> CreateAsync(CreateCustomerRequest request)
    {
        if (await _repository.ExistsByCodeAsync(request.Code))
            throw new BusinessException("رمز العميل موجود مسبقاً");

        var customer = new Customer
        {
            Code = request.Code,
            Name = request.Name,
            Type = request.Type,
            TaxNumber = request.TaxNumber,
            CreditLimit = request.CreditLimit,
            PaymentTerms = request.PaymentTerms,
            Status = CustomerStatus.Active,
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(customer);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(customer.Id);
    }

    public async Task<CustomerResponse> UpdateAsync(Guid id, UpdateCustomerRequest request)
    {
        var customer = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Customer), id);

        customer.Name = request.Name;
        customer.Type = request.Type;
        customer.TaxNumber = request.TaxNumber;
        customer.CreditLimit = request.CreditLimit;
        customer.PaymentTerms = request.PaymentTerms;
        customer.Status = request.Status;
        customer.UpdatedBy = _currentUserService.UserId;

        await _repository.UpdateAsync(customer);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await _repository.ExistsByIdAsync(id))
            throw new NotFoundException(nameof(Customer), id);

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }
}
