using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Features.HR.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _repository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public EmployeeService(
        IEmployeeRepository repository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<EmployeeListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, Guid? departmentId, EmployeeStatus? status)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, departmentId, status);

    public async Task<EmployeeResponse> GetByIdAsync(Guid id)
    {
        var employee = await _repository.GetByIdAsync(id);
        if (employee is null) throw new NotFoundException(nameof(Employee), id);
        return employee;
    }

    public async Task<List<EmployeeListItemResponse>> GetAllForDropdownAsync()
        => await _repository.GetAllForDropdownAsync();

    public async Task<EmployeeResponse> CreateAsync(CreateEmployeeRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Email) && await _repository.IsEmailAsync(request.Email))
            throw new BusinessException("البريد الإلكتروني مستخدم من قبل موظف آخر");

        if (request.DepartmentId.HasValue && !await _repository.DepartmentIdExistsAsync(request.DepartmentId.Value))
            throw new BusinessException("القسم المحدد غير موجود");

        if (request.ManagerId.HasValue && !await _repository.ExistsByIdAsync(request.ManagerId.Value))
            throw new BusinessException("المدير المحدد غير موجود");

        if (request.UserId.HasValue)
        {
            if (!await _repository.UserIdExistsAsync(request.UserId.Value))
                throw new BusinessException("حساب المستخدم المحدد غير موجود");

            if (await _repository.IsUserIdLinkedAsync(request.UserId.Value))
                throw new BusinessException("حساب المستخدم مرتبط بموظف آخر");
        }

        var employee = new Employee
        {
            EmployeeNumber = await _repository.GenerateEmployeeNumberAsync(),
            FirstName = (request.FirstName ?? string.Empty).Trim(),
            LastName = (request.LastName ?? string.Empty).Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone,
            HireDate = request.HireDate,
            DepartmentId = request.DepartmentId,
            JobTitle = request.JobTitle,
            EmploymentType = request.EmploymentType,
            Salary = request.Salary,
            Currency = "SAR",
            ManagerId = request.ManagerId,
            Status = EmployeeStatus.Active,
            UserId = request.UserId,
            Notes = request.Notes,
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(employee);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(employee.Id);
    }

    public async Task<EmployeeResponse> UpdateAsync(Guid id, UpdateEmployeeRequest request)
    {
        var employee = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Employee), id);

        if (request.ManagerId == id)
            throw new BusinessException("لا يمكن أن يكون الموظف مديراً لنفسه");

        if (!string.IsNullOrWhiteSpace(request.Email) && await _repository.IsEmailAsync(request.Email, id))
            throw new BusinessException("البريد الإلكتروني مستخدم من قبل موظف آخر");

        if (request.DepartmentId.HasValue && !await _repository.DepartmentIdExistsAsync(request.DepartmentId.Value))
            throw new BusinessException("القسم المحدد غير موجود");

        if (request.ManagerId.HasValue && !await _repository.ExistsByIdAsync(request.ManagerId.Value))
            throw new BusinessException("المدير المحدد غير موجود");

        if (request.UserId.HasValue)
        {
            if (!await _repository.UserIdExistsAsync(request.UserId.Value))
                throw new BusinessException("حساب المستخدم المحدد غير موجود");

            if (await _repository.IsUserIdLinkedAsync(request.UserId.Value, id))
                throw new BusinessException("حساب المستخدم مرتبط بموظف آخر");
        }

        employee.FirstName = (request.FirstName ?? string.Empty).Trim();
        employee.LastName = (request.LastName ?? string.Empty).Trim();
        employee.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        employee.Phone = request.Phone;
        employee.HireDate = request.HireDate;
        employee.DepartmentId = request.DepartmentId;
        employee.JobTitle = request.JobTitle;
        employee.EmploymentType = request.EmploymentType;
        employee.Salary = request.Salary;
        employee.ManagerId = request.ManagerId;
        employee.Status = request.Status;
        employee.UserId = request.UserId;
        employee.Notes = request.Notes;
        employee.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await _repository.ExistsByIdAsync(id))
            throw new NotFoundException(nameof(Employee), id);

        if (await _repository.IsManagerOfOthersAsync(id))
            throw new BusinessException("لا يمكن حذف موظف يشرف على موظفين آخرين");

        if (await _repository.IsDepartmentManagerAsync(id))
            throw new BusinessException("لا يمكن حذف موظف يدير أحد الأقسام");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }
}