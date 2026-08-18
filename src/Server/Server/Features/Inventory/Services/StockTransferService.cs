using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory.Entities;
using Server.Features.Inventory.Enums;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Services;

public class StockTransferService : IStockTransferService
{
    private const string TransferMovementType = "Transfer";
    private const string TransferReferenceType = "StockTransfer";

    private readonly IStockTransferRepository _repository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public StockTransferService(
        IStockTransferRepository repository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<StockTransferListItemResponse>> GetAllAsync(
        int page, int pageSize, StockTransferStatus? status = null)
        => await _repository.GetAllAsync(page, pageSize, status);

    public async Task<StockTransferResponse> GetByIdAsync(Guid id)
    {
        var transfer = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(StockTransfer), id);
        return transfer;
    }

    public async Task<StockTransferResponse> CreateAsync(CreateStockTransferRequest request)
    {
        await ValidateTransferAsync(request.FromWarehouseId, request.ToWarehouseId, request.ProductId, request.Quantity);

        var transferNumber = await _repository.GenerateTransferNumberAsync();

        var transfer = new StockTransfer
        {
            TransferNumber = transferNumber,
            FromWarehouseId = request.FromWarehouseId,
            ToWarehouseId = request.ToWarehouseId,
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            Notes = request.Notes,
            Status = StockTransferStatus.Draft,
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(transfer);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(transfer.Id);
    }

    public async Task<StockTransferResponse> UpdateAsync(Guid id, UpdateStockTransferRequest request)
    {
        var transfer = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(StockTransfer), id);

        if (transfer.Status != StockTransferStatus.Draft)
            throw new BusinessException("لا يمكن تعديل التحويل إلا في حالة المسودة");

        await ValidateTransferAsync(request.FromWarehouseId, request.ToWarehouseId, request.ProductId, request.Quantity, id);

        transfer.FromWarehouseId = request.FromWarehouseId;
        transfer.ToWarehouseId = request.ToWarehouseId;
        transfer.ProductId = request.ProductId;
        transfer.Quantity = request.Quantity;
        transfer.Notes = request.Notes;
        transfer.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task SubmitAsync(Guid id)
    {
        var transfer = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(StockTransfer), id);

        if (transfer.Status != StockTransferStatus.Draft)
            throw new BusinessException("لا يمكن إرسال التحويل إلا من حالة المسودة");

        transfer.Status = StockTransferStatus.Submitted;
        transfer.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task ApproveAsync(Guid id)
    {
        var transfer = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(StockTransfer), id);

        if (transfer.Status != StockTransferStatus.Submitted)
            throw new BusinessException("لا يمكن اعتماد التحويل إلا من حالة الإرسال");

        transfer.Status = StockTransferStatus.Approved;
        transfer.ApprovedBy = _currentUserService.UserId;
        transfer.ApprovedAt = DateTime.UtcNow;
        transfer.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task CompleteAsync(Guid id)
    {
        var transfer = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(StockTransfer), id);

        if (transfer.Status != StockTransferStatus.Approved)
            throw new BusinessException("لا يمكن إكمال التحويل إلا من حالة الاعتماد");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Re-check availability inside the transaction (prevents race condition)
            var sourceLevel = await _context.InventoryLevels
                .FirstOrDefaultAsync(l => l.ProductId == transfer.ProductId && l.WarehouseId == transfer.FromWarehouseId);

            var available = sourceLevel?.QuantityAvailable ?? 0;
            if (available < transfer.Quantity)
                throw new BusinessException(
                    $"الكمية المطلوبة غير متوفرة في المستودع المصدر. المتاح: {available}");

            // 1. Decrease stock in source warehouse
            if (sourceLevel is not null)
            {
                sourceLevel.QuantityOnHand = Math.Max(0, sourceLevel.QuantityOnHand - transfer.Quantity);
                sourceLevel.LastMovement = DateTime.UtcNow;
                sourceLevel.UpdatedBy = _currentUserService.UserId;
            }

            // 2. Increase stock in destination warehouse (create level if missing)
            var destLevel = await _context.InventoryLevels
                .FirstOrDefaultAsync(l => l.ProductId == transfer.ProductId && l.WarehouseId == transfer.ToWarehouseId);

            if (destLevel is null)
            {
                _context.InventoryLevels.Add(new InventoryLevel
                {
                    ProductId = transfer.ProductId,
                    WarehouseId = transfer.ToWarehouseId,
                    QuantityOnHand = transfer.Quantity,
                    LastMovement = DateTime.UtcNow,
                    CreatedBy = _currentUserService.UserId
                });
            }
            else
            {
                destLevel.QuantityOnHand += transfer.Quantity;
                destLevel.LastMovement = DateTime.UtcNow;
                destLevel.UpdatedBy = _currentUserService.UserId;
            }

            // 3. Stock movement for source warehouse (negative)
            _context.StockMovements.Add(new StockMovement
            {
                MovementType = TransferMovementType,
                ReferenceType = TransferReferenceType,
                ReferenceId = transfer.Id,
                ProductId = transfer.ProductId,
                WarehouseId = transfer.FromWarehouseId,
                Quantity = -transfer.Quantity,
                MovementDate = DateTime.UtcNow,
                Notes = $"Transfer out {transfer.TransferNumber}",
                CreatedBy = _currentUserService.UserId
            });

            // 4. Stock movement for destination warehouse (positive)
            _context.StockMovements.Add(new StockMovement
            {
                MovementType = TransferMovementType,
                ReferenceType = TransferReferenceType,
                ReferenceId = transfer.Id,
                ProductId = transfer.ProductId,
                WarehouseId = transfer.ToWarehouseId,
                Quantity = transfer.Quantity,
                MovementDate = DateTime.UtcNow,
                Notes = $"Transfer in {transfer.TransferNumber}",
                CreatedBy = _currentUserService.UserId
            });

            // 5. Mark transfer as completed
            transfer.Status = StockTransferStatus.Completed;
            transfer.CompletedAt = DateTime.UtcNow;
            transfer.UpdatedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task CancelAsync(Guid id)
    {
        var transfer = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(StockTransfer), id);

        if (transfer.Status is not (StockTransferStatus.Submitted or StockTransferStatus.Approved))
            throw new BusinessException("لا يمكن إلغاء التحويل في حالته الحالية");

        transfer.Status = StockTransferStatus.Cancelled;
        transfer.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var transfer = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(StockTransfer), id);

        if (transfer.Status != StockTransferStatus.Draft)
            throw new BusinessException("لا يمكن حذف التحويل إلا في حالة المسودة");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    private async Task ValidateTransferAsync(
        Guid fromWarehouseId, Guid toWarehouseId, Guid productId, decimal quantity, Guid? excludeId = null)
    {
        if (fromWarehouseId == toWarehouseId)
            throw new BusinessException("لا يمكن أن يكون المستودع المصدر والوجهة متطابقين");

        var fromWarehouse = await _warehouseRepository.GetEntityByIdAsync(fromWarehouseId)
            ?? throw new NotFoundException(nameof(Warehouse), fromWarehouseId);

        if (!fromWarehouse.IsActive)
            throw new BusinessException("لا يمكن التحويل من مستودع غير نشط");

        var toWarehouse = await _warehouseRepository.GetEntityByIdAsync(toWarehouseId)
            ?? throw new NotFoundException(nameof(Warehouse), toWarehouseId);

        if (!toWarehouse.IsActive)
            throw new BusinessException("لا يمكن التحويل إلى مستودع غير نشط");

        var product = await _productRepository.GetEntityByIdAsync(productId)
            ?? throw new NotFoundException(nameof(Product), productId);

        if (!product.IsActive)
            throw new BusinessException($"المنتج '{product.Name}' غير نشط");

        if (quantity <= 0)
            throw new BusinessException("الكمية يجب أن تكون أكبر من صفر");

        var available = await _repository.GetAvailableStockAsync(productId, fromWarehouseId);
        if (available < quantity)
            throw new BusinessException(
                $"الكمية المطلوبة من المنتج '{product.Name}' غير متوفرة في المستودع المصدر. المتاح: {available}");

        if (await _repository.HasActiveTransferAsync(productId, fromWarehouseId, toWarehouseId, excludeId))
            throw new BusinessException("يوجد تحويل نشط لنفس المنتج بين نفس المستودعين");
    }
}
