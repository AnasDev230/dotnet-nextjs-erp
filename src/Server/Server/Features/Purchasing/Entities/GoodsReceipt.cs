using Server.Core.Common;
using Server.Features.Inventory;
using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Entities;

public class GoodsReceipt : BaseEntity
{
    public string GrnNumber { get; set; } = string.Empty;
    public Guid PurchaseOrderId { get; set; }
    public DateOnly ReceiptDate { get; set; }
    public Guid WarehouseId { get; set; }
    public GoodsReceiptStatus Status { get; set; } = GoodsReceiptStatus.Received;
    public string? Notes { get; set; }

    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
    public ICollection<GoodsReceiptItem> Items { get; set; } = new List<GoodsReceiptItem>();
}
