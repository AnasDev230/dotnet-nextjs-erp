using Server.Core.Common;

namespace Server.Features.Inventory;

public class InventoryLevel : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal QuantityOnHand { get; set; }
    public decimal QuantityReserved { get; set; }
    public decimal AvgCost { get; set; }
    public DateTime? LastMovement { get; set; }

    public decimal QuantityAvailable => QuantityOnHand - QuantityReserved;

    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
}
