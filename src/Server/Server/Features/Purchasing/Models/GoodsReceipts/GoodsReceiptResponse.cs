using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Models;

public class GoodsReceiptResponse
{
    public Guid Id { get; set; }
    public string GrnNumber { get; set; } = string.Empty;
    public Guid PurchaseOrderId { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public DateOnly ReceiptDate { get; set; }
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public GoodsReceiptStatus Status { get; set; }
    public string? Notes { get; set; }
    public List<GrnItemResponse> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}