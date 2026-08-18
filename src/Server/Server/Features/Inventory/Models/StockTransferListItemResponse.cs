using Server.Features.Inventory.Enums;

namespace Server.Features.Inventory.Models;

public class StockTransferListItemResponse
{
    public Guid Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public string FromWarehouseName { get; set; } = string.Empty;
    public string ToWarehouseName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public StockTransferStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
