using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Core.Exceptions;
using Server.Features.Inventory;
using Server.Features.Inventory.Repositories;
using Server.Features.Notifications.Enums;
using Server.Features.Notifications.Services;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Services;

public class GoodsReceiptService : IGoodsReceiptService
{
    private const string PurchaseMovementType = "Purchase";
    private const string GrnReferenceType = "GoodsReceipt";

    private readonly IGoodsReceiptRepository _repository;
    private readonly IPurchaseOrderRepository _purchaseOrderRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GoodsReceiptService(
        IGoodsReceiptRepository repository,
        IPurchaseOrderRepository purchaseOrderRepository,
        IWarehouseRepository warehouseRepository,
        INotificationService notificationService,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _purchaseOrderRepository = purchaseOrderRepository;
        _warehouseRepository = warehouseRepository;
        _notificationService = notificationService;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<GoodsReceiptListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? purchaseOrderId, DateOnly? fromDate, DateOnly? toDate)
        => await _repository.GetAllAsync(page, pageSize, searchTerm, purchaseOrderId, fromDate, toDate);

    public async Task<GoodsReceiptResponse> GetByIdAsync(Guid id)
    {
        var receipt = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(GoodsReceipt), id);
        return receipt;
    }

    public async Task<GoodsReceiptResponse> CreateAsync(CreateGoodsReceiptRequest request)
    {
        // 1. Validate purchase order exists and is receivable
        var order = await _purchaseOrderRepository.GetByIdWithItemsAsync(request.PurchaseOrderId)
            ?? throw new NotFoundException(nameof(PurchaseOrder), request.PurchaseOrderId);

        if (order.Status is not (PurchaseOrderStatus.Approved or PurchaseOrderStatus.PartiallyReceived))
            throw new BusinessException("لا يمكن استلام بضاعة لأمر شراء غير معتمد");

        // 2. Validate warehouse exists and is active
        var warehouse = await _warehouseRepository.GetEntityByIdAsync(request.WarehouseId)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        if (!warehouse.IsActive)
            throw new BusinessException("لا يمكن الاستلام في مستودع غير نشط");

        // 3. Validate receipt items against PO lines (no over-receiving)
        ValidateItems(request, order);

        // 4. Generate GRN number
        var grnNumber = await _repository.GenerateGrnNumberAsync();

        // 5. Persist GRN + update PO received qty + update inventory + stock movement
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var grn = new GoodsReceipt
            {
                GrnNumber = grnNumber,
                PurchaseOrderId = request.PurchaseOrderId,
                ReceiptDate = request.ReceiptDate,
                WarehouseId = request.WarehouseId,
                Status = GoodsReceiptStatus.Received,
                Notes = request.Notes,
                CreatedBy = _currentUserService.UserId,
                Items = new List<GoodsReceiptItem>()
            };

            foreach (var item in request.Items)
            {
                var poItem = order.Items.First(i => i.Id == item.PoItemId);

                grn.Items.Add(new GoodsReceiptItem
                {
                    PoItemId = item.PoItemId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    CreatedBy = _currentUserService.UserId
                });

                // 5b. Update PO line received quantity
                poItem.ReceivedQty += item.Quantity;
                poItem.UpdatedBy = _currentUserService.UserId;

                // 5c. Update / create inventory level
                var level = await _context.InventoryLevels
                    .FirstOrDefaultAsync(l => l.ProductId == item.ProductId && l.WarehouseId == request.WarehouseId);

                if (level is null)
                {
                    _context.InventoryLevels.Add(new InventoryLevel
                    {
                        ProductId = item.ProductId,
                        WarehouseId = request.WarehouseId,
                        QuantityOnHand = item.Quantity,
                        LastMovement = DateTime.UtcNow,
                        CreatedBy = _currentUserService.UserId
                    });
                }
                else
                {
                    level.QuantityOnHand += item.Quantity;
                    level.LastMovement = DateTime.UtcNow;
                    level.UpdatedBy = _currentUserService.UserId;
                }

                // 5d. Stock movement audit record
                _context.StockMovements.Add(new StockMovement
                {
                    MovementType = PurchaseMovementType,
                    ReferenceType = GrnReferenceType,
                    ReferenceId = grn.Id,
                    ProductId = item.ProductId,
                    WarehouseId = request.WarehouseId,
                    Quantity = item.Quantity,
                    UnitCost = poItem.UnitPrice,
                    TotalCost = item.Quantity * poItem.UnitPrice,
                    MovementDate = DateTime.UtcNow,
                    CreatedBy = _currentUserService.UserId
                });
            }

            await _notificationService.CreateForRoleAsync(
                Roles.WarehouseKeeper,
                NotificationType.GoodsReceiptCompleted,
                "تم استلام بضاعة جديدة",
                $"إشعار الاستلام {grn.GrnNumber} لأمر الشراء {order.PoNumber} اكتمل",
                grn.Id);

            await _repository.AddAsync(grn);
            await _context.SaveChangesAsync();

            // 5e. Recalculate PO status
            UpdateOrderStatus(order);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return await GetByIdAsync(grn.Id);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task CancelAsync(Guid id)
    {
        var grn = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new NotFoundException(nameof(GoodsReceipt), id);

        if (grn.Status == GoodsReceiptStatus.Cancelled)
            throw new BusinessException("هذا الاستلام ملغي بالفعل");

        var order = await _purchaseOrderRepository.GetByIdWithItemsAsync(grn.PurchaseOrderId)
            ?? throw new NotFoundException(nameof(PurchaseOrder), grn.PurchaseOrderId);

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in grn.Items)
            {
                var poItem = order.Items.FirstOrDefault(i => i.Id == item.PoItemId);
                if (poItem is not null)
                {
                    poItem.ReceivedQty = Math.Max(0, poItem.ReceivedQty - item.Quantity);
                    poItem.UpdatedBy = _currentUserService.UserId;
                }

                var level = await _context.InventoryLevels
                    .FirstOrDefaultAsync(l => l.ProductId == item.ProductId && l.WarehouseId == grn.WarehouseId);

                if (level is not null)
                {
                    level.QuantityOnHand = Math.Max(0, level.QuantityOnHand - item.Quantity);
                    level.LastMovement = DateTime.UtcNow;
                    level.UpdatedBy = _currentUserService.UserId;
                }
            }

            // Mark linked purchase stock movements as deleted (reversed)
            var movements = await _context.StockMovements
                .Where(m => m.ReferenceType == GrnReferenceType
                            && m.ReferenceId == grn.Id
                            && m.MovementType == PurchaseMovementType)
                .ToListAsync();

            foreach (var movement in movements)
            {
                movement.DeletedAt = DateTime.UtcNow;
                movement.UpdatedBy = _currentUserService.UserId;
            }

            // Recalculate PO status after reversal
            if (order.Items.All(i => i.ReceivedQty <= 0))
                order.Status = PurchaseOrderStatus.Approved;
            else
                order.Status = PurchaseOrderStatus.PartiallyReceived;

            grn.Status = GoodsReceiptStatus.Cancelled;
            grn.UpdatedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static void ValidateItems(CreateGoodsReceiptRequest request, PurchaseOrder order)
    {
        if (request.Items == null || request.Items.Count == 0)
            throw new BusinessException("يجب إضافة عنصر استلام واحد على الأقل");

        foreach (var item in request.Items)
        {
            var poItem = order.Items.FirstOrDefault(i => i.Id == item.PoItemId);
            if (poItem is null)
                throw new BusinessException("أحد عناصر الاستلام غير موجود في أمر الشراء");

            if (poItem.ProductId != item.ProductId)
                throw new BusinessException($"المنتج المحدد لا يطابق منتج سطر أمر الشراء لـ '{poItem.ProductId}'");

            if (item.Quantity <= 0)
                throw new BusinessException("الكمية المستلمة يجب أن تكون أكبر من صفر");

            var remaining = poItem.Quantity - poItem.ReceivedQty;
            if (item.Quantity > remaining)
                throw new BusinessException($"الكمية المستلمة تتجاوز الكمية المتبقية ({remaining}) لسطر أمر الشراء");
        }
    }

    private static void UpdateOrderStatus(PurchaseOrder order)
    {
        var allReceived = order.Items.Count > 0 && order.Items.All(i => i.ReceivedQty >= i.Quantity);
        order.Status = allReceived ? PurchaseOrderStatus.Received : PurchaseOrderStatus.PartiallyReceived;
    }
}