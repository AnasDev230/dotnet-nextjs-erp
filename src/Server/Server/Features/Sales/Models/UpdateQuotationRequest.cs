namespace Server.Features.Sales.Models;

public class UpdateQuotationRequest
{
    public DateTime QuotationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public string? Notes { get; set; }
    public List<QuotationItemRequest> Items { get; set; } = new();
}
