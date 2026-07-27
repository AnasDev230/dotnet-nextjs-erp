namespace Server.Features.Inventory.Models;

public class StockAdjustmentResponse
{
    public Guid Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public decimal CountedQty { get; set; }
    public decimal SystemQty { get; set; }
    public decimal Variance { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
