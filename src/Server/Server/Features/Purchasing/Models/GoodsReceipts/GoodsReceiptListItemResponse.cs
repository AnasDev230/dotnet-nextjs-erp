using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Models;

public class GoodsReceiptListItemResponse
{
    public Guid Id { get; set; }
    public string GrnNumber { get; set; } = string.Empty;
    public string PoNumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public DateOnly ReceiptDate { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public GoodsReceiptStatus Status { get; set; }
}