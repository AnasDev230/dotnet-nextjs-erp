using Server.Core.Common;
using Server.Features.Inventory;

namespace Server.Features.Sales;

public class SalesOrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }  // computed: Quantity x UnitPrice x (1 - DiscountPct/100)
    public decimal DiscountPct { get; set; }

    // Navigation
    public SalesOrder Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
