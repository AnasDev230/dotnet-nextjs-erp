using Server.Core.Common;
using Server.Features.Inventory;
using Server.Features.Sales.Enums;

namespace Server.Features.Purchasing.Entities;

public class PurchaseReturn : BaseEntity
{
    /// <summary>Auto-generated: PRET-YYYY-XXXX</summary>
    public string ReturnNumber { get; set; } = string.Empty;

    /// <summary>Linked Goods Receipt (the original receipt).</summary>
    public Guid GoodsReceiptId { get; set; }
    public GoodsReceipt GoodsReceipt { get; set; } = null!;

    /// <summary>Supplier we're returning to.</summary>
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    /// <summary>Warehouse where items come from.</summary>
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;

    /// <summary>Reason for return.</summary>
    public string? Reason { get; set; }

    /// <summary>Return date.</summary>
    public DateTime ReturnDate { get; set; }

    /// <summary>Total amount credited by supplier.</summary>
    public decimal TotalAmount { get; set; }

    /// <summary>Status.</summary>
    public ReturnStatus Status { get; set; } = ReturnStatus.Draft;

    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Items
    public ICollection<PurchaseReturnItem> Items { get; set; } = new List<PurchaseReturnItem>();
}