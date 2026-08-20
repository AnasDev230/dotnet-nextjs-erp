using Server.Core.Common;
using Server.Features.Finance;
using Server.Features.Inventory;
using Server.Features.Sales.Enums;

namespace Server.Features.Sales.Entities;

public class SalesReturn : BaseEntity
{
    /// <summary>Auto-generated: SRET-YYYY-XXXX</summary>
    public string ReturnNumber { get; set; } = string.Empty;

    /// <summary>Linked Invoice (the original sale).</summary>
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;

    /// <summary>Customer returning the products.</summary>
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    /// <summary>Warehouse where items will be returned to.</summary>
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;

    /// <summary>Reason for return.</summary>
    public string? Reason { get; set; }

    /// <summary>Return date.</summary>
    public DateTime ReturnDate { get; set; }

    /// <summary>Total refund amount.</summary>
    public decimal TotalAmount { get; set; }

    /// <summary>Status.</summary>
    public ReturnStatus Status { get; set; } = ReturnStatus.Draft;

    /// <summary>Who approved.</summary>
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Items
    public ICollection<SalesReturnItem> Items { get; set; } = new List<SalesReturnItem>();
}