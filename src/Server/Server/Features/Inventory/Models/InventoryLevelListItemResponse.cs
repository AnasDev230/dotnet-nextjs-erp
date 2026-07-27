namespace Server.Features.Inventory.Models;

public class InventoryLevelListItemResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public decimal QuantityOnHand { get; set; }
    public decimal QuantityReserved { get; set; }
    public decimal QuantityAvailable { get; set; }
    public decimal ReorderLevel { get; set; }
    public bool IsLowStock { get; set; }
    public decimal AvgCost { get; set; }
    public DateTime? LastMovement { get; set; }
}
