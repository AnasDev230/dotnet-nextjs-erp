using Server.Core.Common;
using Server.Features.Inventory;

namespace Server.Features.Sales.Entities;

public class SalesReturnItem : BaseEntity
{
    public Guid SalesReturnId { get; set; }
    public SalesReturn SalesReturn { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>Quantity being returned.</summary>
    public decimal Quantity { get; set; }

    /// <summary>Unit price (from original invoice).</summary>
    public decimal UnitPrice { get; set; }

    /// <summary>Line total = Quantity × UnitPrice.</summary>
    public decimal LineTotal { get; set; }

    /// <summary>Reason for this specific item return.</summary>
    public string? Reason { get; set; }
}