using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Services;

public class InventoryLevelService : IInventoryLevelService
{
    private readonly IInventoryLevelRepository _repository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public InventoryLevelService(
        IInventoryLevelRepository repository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<InventoryLevelListItemResponse>> GetAllAsync(
        int page, int pageSize, Guid? productId, Guid? warehouseId, bool? lowStockOnly)
        => await _repository.GetAllAsync(page, pageSize, productId, warehouseId, lowStockOnly);

    public async Task<InventoryLevelResponse> GetByIdAsync(Guid id)
    {
        var level = await _repository.GetByIdAsync(id);
        if (level is null) throw new NotFoundException(nameof(InventoryLevel), id);
        return level;
    }

    public async Task<InventoryLevelResponse> UpsertAsync(UpsertInventoryLevelRequest request)
    {
        var existing = await _repository.FindByProductAndWarehouseAsync(request.ProductId, request.WarehouseId);

        if (existing is not null)
        {
            existing.QuantityOnHand = request.QuantityOnHand;
            existing.AvgCost = request.AvgCost;
            existing.LastMovement = DateTime.UtcNow;
            existing.UpdatedBy = _currentUserService.UserId;

            _repository.Update(existing);
        }
        else
        {
            existing = new InventoryLevel
            {
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                QuantityOnHand = request.QuantityOnHand,
                AvgCost = request.AvgCost,
                LastMovement = DateTime.UtcNow,
                CreatedBy = _currentUserService.UserId,
            };

            await _repository.AddAsync(existing);
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(existing.Id);
    }
}
