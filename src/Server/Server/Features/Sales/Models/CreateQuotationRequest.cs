namespace Server.Features.Sales.Models;

public class CreateQuotationRequest
{
    public Guid CustomerId { get; set; }
    public DateTime QuotationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public string? Notes { get; set; }
    public List<QuotationItemRequest> Items { get; set; } = new();
}
