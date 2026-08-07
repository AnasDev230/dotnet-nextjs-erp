using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Models;

public class PurchaseOrderResponse
{
    public Guid Id { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateOnly OrderDate { get; set; }
    public DateOnly? ExpectedDate { get; set; }
    public PurchaseOrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? Terms { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public List<PoItemResponse> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
