using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Services;

public class StockAdjustmentService : IStockAdjustmentService
{
    private readonly IStockAdjustmentRepository _adjustmentRepository;
    private readonly IInventoryLevelRepository _levelRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public StockAdjustmentService(
        IStockAdjustmentRepository adjustmentRepository,
        IInventoryLevelRepository levelRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _adjustmentRepository = adjustmentRepository;
        _levelRepository = levelRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<StockAdjustmentResponse>> GetAllAsync(
        int page, int pageSize, Guid? productId, Guid? warehouseId)
        => await _adjustmentRepository.GetAllAsync(page, pageSize, productId, warehouseId);

    public async Task<StockAdjustmentResponse> CreateAsync(CreateStockAdjustmentRequest request)
    {
        var level = await _levelRepository.FindByProductAndWarehouseAsync(request.ProductId, request.WarehouseId)
            ?? throw new NotFoundException(nameof(InventoryLevel), $"Product {request.ProductId} / Warehouse {request.WarehouseId}");

        var systemQty = level.QuantityOnHand;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            level.QuantityOnHand = request.CountedQty;
            level.LastMovement = DateTime.UtcNow;
            level.UpdatedBy = _currentUserService.UserId;
            _levelRepository.Update(level);

            var adjustment = new StockAdjustment
            {
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                CountedQty = request.CountedQty,
                SystemQty = systemQty,
                Reason = request.Reason,
                CreatedBy = _currentUserService.UserId,
            };

            await _adjustmentRepository.AddAsync(adjustment);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new StockAdjustmentResponse
            {
                Id = adjustment.Id,
                ProductName = level.Product?.Name ?? string.Empty,
                WarehouseName = level.Warehouse?.Name ?? string.Empty,
                CountedQty = adjustment.CountedQty,
                SystemQty = adjustment.SystemQty,
                Variance = adjustment.Variance,
                Reason = adjustment.Reason,
                CreatedAt = adjustment.CreatedAt,
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
