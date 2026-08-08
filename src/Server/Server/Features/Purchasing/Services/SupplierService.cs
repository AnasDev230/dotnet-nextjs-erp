using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Services;

public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _repository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SupplierService(
        ISupplierRepository repository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<SupplierListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, SupplierStatus? status)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, status);

    public async Task<SupplierResponse> GetByIdAsync(Guid id)
    {
        var supplier = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Supplier), id);

        return MapToResponse(supplier);
    }

    public async Task<List<SupplierListItemResponse>> GetForDropdownAsync()
        => await _repository.GetForDropdownAsync();

    public async Task<SupplierResponse> CreateAsync(CreateSupplierRequest request)
    {
        if (await _repository.IsNameUniqueAsync(request.Name))
            throw new BusinessException("اسم المورد موجود بالفعل");

        var supplier = new Supplier
        {
            Code = await _repository.GenerateCodeAsync(),
            Name = request.Name.Trim(),
            ContactPerson = request.ContactPerson,
            Email = request.Email,
            Phone = request.Phone,
            TaxNumber = request.TaxNumber,
            PaymentTerms = request.PaymentTerms,
            Rating = request.Rating,
            Status = SupplierStatus.Active,
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(supplier);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(supplier.Id);
    }

    public async Task<SupplierResponse> UpdateAsync(Guid id, UpdateSupplierRequest request)
    {
        var supplier = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Supplier), id);

        if (await _repository.HasUnfulfilledOrdersAsync(id))
            throw new BusinessException("لا يمكن تعديل المورد أثناء وجود أوامر شراء قيد التنفيذ");

        if (await _repository.IsNameUniqueAsync(request.Name, id))
            throw new BusinessException("اسم المورد موجود بالفعل");

        supplier.Name = request.Name.Trim();
        supplier.ContactPerson = request.ContactPerson;
        supplier.Email = request.Email;
        supplier.Phone = request.Phone;
        supplier.TaxNumber = request.TaxNumber;
        supplier.PaymentTerms = request.PaymentTerms;
        supplier.Rating = request.Rating;
        supplier.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task SuspendAsync(Guid id)
    {
        var supplier = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Supplier), id);

        if (await _repository.HasUnfulfilledOrdersAsync(id))
            throw new BusinessException("لا يمكن إيقاف المورد أثناء وجود أوامر شراء قيد التنفيذ");

        supplier.Status = SupplierStatus.Suspended;
        supplier.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task ActivateAsync(Guid id)
    {
        var supplier = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Supplier), id);

        supplier.Status = SupplierStatus.Active;
        supplier.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var supplier = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Supplier), id);

        if (await _context.PurchaseOrders.AnyAsync(po => po.SupplierId == id))
            throw new BusinessException("لا يمكن حذف مورد مرتبط بأوامر شراء");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    private static SupplierResponse MapToResponse(Supplier s) => new()
    {
        Id = s.Id,
        Code = s.Code,
        Name = s.Name,
        ContactPerson = s.ContactPerson,
        Email = s.Email,
        Phone = s.Phone,
        TaxNumber = s.TaxNumber,
        PaymentTerms = s.PaymentTerms,
        Rating = s.Rating,
        Status = s.Status,
        CreatedAt = s.CreatedAt
    };
}
