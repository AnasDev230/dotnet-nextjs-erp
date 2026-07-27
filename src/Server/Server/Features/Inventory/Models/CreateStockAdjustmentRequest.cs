namespace Server.Features.Inventory.Models;

public class CreateStockAdjustmentRequest
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal CountedQty { get; set; }
    public string Reason { get; set; } = string.Empty;
}
