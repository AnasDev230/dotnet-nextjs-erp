namespace Server.Features.Inventory.Models;

public class UpsertInventoryLevelRequest
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal QuantityOnHand { get; set; }
    public decimal AvgCost { get; set; }
}
