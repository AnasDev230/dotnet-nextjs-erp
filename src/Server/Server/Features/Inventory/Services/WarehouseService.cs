using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Services;

public class WarehouseService : IWarehouseService
{
    private readonly IWarehouseRepository _repository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public WarehouseService(
        IWarehouseRepository repository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<WarehouseListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, bool? isActive)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, isActive);

    public async Task<WarehouseResponse> GetByIdAsync(Guid id)
    {
        var warehouse = await _repository.GetByIdAsync(id);
        if (warehouse is null) throw new NotFoundException(nameof(Warehouse), id);
        return warehouse;
    }

    public async Task<List<WarehouseListItemResponse>> GetAllForDropdownAsync()
        => await _repository.GetAllForDropdownAsync();

    public async Task<WarehouseResponse> CreateAsync(CreateWarehouseRequest request)
    {
        if (await _repository.ExistsByCodeAsync(request.Code))
            throw new BusinessException("رمز المستودع موجود مسبقاً");

        var warehouse = new Warehouse
        {
            Code = request.Code,
            Name = request.Name,
            Location = request.Location,
            IsActive = true,
            CreatedBy = _currentUserService.UserId,
        };

        await _repository.AddAsync(warehouse);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(warehouse.Id);
    }

    public async Task<WarehouseResponse> UpdateAsync(Guid id, UpdateWarehouseRequest request)
    {
        var warehouse = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Warehouse), id);

        warehouse.Name = request.Name;
        warehouse.Location = request.Location;
        warehouse.IsActive = request.IsActive;
        warehouse.UpdatedBy = _currentUserService.UserId;

        _repository.Update(warehouse);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await _repository.ExistsByIdAsync(id))
            throw new NotFoundException(nameof(Warehouse), id);

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }
}
