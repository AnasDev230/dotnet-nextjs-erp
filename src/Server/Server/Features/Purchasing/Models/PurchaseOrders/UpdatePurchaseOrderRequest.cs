namespace Server.Features.Purchasing.Models;

public class UpdatePurchaseOrderRequest
{
    public Guid SupplierId { get; set; }
    public DateOnly OrderDate { get; set; }
    public DateOnly? ExpectedDate { get; set; }
    public string Currency { get; set; } = "SAR";
    public string? Terms { get; set; }
    public List<PoItemRequest> Items { get; set; } = new();
}
