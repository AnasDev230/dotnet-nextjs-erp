using Server.Core.Common;
using Server.Features.Inventory.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Entities;

public class StockTransfer : BaseEntity
{
    /// <summary>Auto-generated: TRF-YYYY-XXXX</summary>
    public string TransferNumber { get; set; } = string.Empty;

    /// <summary>Source warehouse (stock leaves from here).</summary>
    public Guid FromWarehouseId { get; set; }
    public Warehouse FromWarehouse { get; set; } = null!;

    /// <summary>Destination warehouse (stock arrives here).</summary>
    public Guid ToWarehouseId { get; set; }
    public Warehouse ToWarehouse { get; set; } = null!;

    /// <summary>Product being transferred.</summary>
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>Quantity to transfer.</summary>
    public decimal Quantity { get; set; }

    /// <summary>Current status of the transfer.</summary>
    public StockTransferStatus Status { get; set; } = StockTransferStatus.Draft;

    /// <summary>Who approved the transfer.</summary>
    public Guid? ApprovedBy { get; set; }

    /// <summary>When it was approved.</summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>When it was completed (stock actually moved).</summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>Optional notes/reason for transfer.</summary>
    public string? Notes { get; set; }

    // Navigation
    public ApplicationUser? ApprovedByUser { get; set; }
}
