using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.HR.Entities;
using Server.Features.HR.Models;
using Server.Features.HR.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _repository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DepartmentService(
        IDepartmentRepository repository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<DepartmentListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, bool? isActive)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, isActive);

    public async Task<DepartmentResponse> GetByIdAsync(Guid id)
    {
        var department = await _repository.GetByIdAsync(id);
        if (department is null) throw new NotFoundException(nameof(Department), id);
        return department;
    }

    public async Task<List<DepartmentListItemResponse>> GetAllForDropdownAsync()
        => await _repository.GetAllForDropdownAsync();

    public async Task<DepartmentResponse> CreateAsync(CreateDepartmentRequest request)
    {
        if (await _repository.IsNameUniqueAsync(request.Name))
            throw new BusinessException("اسم القسم موجود مسبقاً");

        if (request.ParentId.HasValue && !await _repository.ExistsByIdAsync(request.ParentId.Value))
            throw new BusinessException("القسم الأب غير موجود");

        if (request.ManagerId.HasValue && !await _context.Employees.AnyAsync(e => e.Id == request.ManagerId.Value))
            throw new BusinessException("الموظف المدير غير موجود");

        var department = new Department
        {
            Code = await _repository.GenerateCodeAsync(),
            Name = request.Name.Trim(),
            ParentId = request.ParentId,
            ManagerId = request.ManagerId,
            Description = request.Description,
            IsActive = true,
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(department);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(department.Id);
    }

    public async Task<DepartmentResponse> UpdateAsync(Guid id, UpdateDepartmentRequest request)
    {
        var department = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Department), id);

        if (request.ParentId == id)
            throw new BusinessException("لا يمكن جعل القسم أصل بنفسه");

        if (await _repository.IsNameUniqueAsync(request.Name, id))
            throw new BusinessException("اسم القسم موجود مسبقاً");

        if (request.ParentId.HasValue)
        {
            if (!await _repository.ExistsByIdAsync(request.ParentId.Value))
                throw new BusinessException("القسم الأب غير موجود");

            await EnsureNoCircularParentAsync(id, request.ParentId.Value);
        }

        if (request.ManagerId.HasValue && !await _context.Employees.AnyAsync(e => e.Id == request.ManagerId.Value))
            throw new BusinessException("الموظف المدير غير موجود");

        department.Name = request.Name.Trim();
        department.ParentId = request.ParentId;
        department.ManagerId = request.ManagerId;
        department.Description = request.Description;
        department.IsActive = request.IsActive;
        department.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await _repository.ExistsByIdAsync(id))
            throw new NotFoundException(nameof(Department), id);

        if (await _repository.HasEmployeesAsync(id))
            throw new BusinessException("لا يمكن حذف قسم يحتوي على موظفين");

        if (await _repository.HasChildrenAsync(id))
            throw new BusinessException("لا يمكن حذف قسم يحتوي على أقسام فرعية");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureNoCircularParentAsync(Guid departmentId, Guid parentId)
    {
        var current = (Guid?)parentId;

        while (current.HasValue)
        {
            if (current.Value == departmentId)
                throw new BusinessException("لا يمكن جعل أحد الأقسام الفرعية أصلاً لهذا القسم");

            var parent = await _repository.GetEntityByIdAsync(current.Value);
            current = parent?.ParentId;
        }
    }
}