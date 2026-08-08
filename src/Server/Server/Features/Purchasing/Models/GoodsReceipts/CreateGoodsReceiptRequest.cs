namespace Server.Features.Purchasing.Models;

public class CreateGoodsReceiptRequest
{
    public Guid PurchaseOrderId { get; set; }
    public DateOnly ReceiptDate { get; set; }
    public Guid WarehouseId { get; set; }
    public string? Notes { get; set; }
    public List<GrnItemRequest> Items { get; set; } = new();
}