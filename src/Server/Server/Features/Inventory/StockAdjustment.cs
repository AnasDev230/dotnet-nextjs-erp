using Server.Core.Common;

namespace Server.Features.Inventory;

public class StockAdjustment : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal CountedQty { get; set; }
    public decimal SystemQty { get; set; }
    public string Reason { get; set; } = string.Empty;

    public decimal Variance => CountedQty - SystemQty;

    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
}
