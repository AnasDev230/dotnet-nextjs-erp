using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Models;

public class PurchaseOrderListItemResponse
{
    public Guid Id { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public DateOnly OrderDate { get; set; }
    public PurchaseOrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}
