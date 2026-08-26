using Server.Features.Sales.Enums;

namespace Server.Features.Sales.Models;

public class QuotationResponse
{
    public Guid Id { get; set; }
    public string QuotationNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime QuotationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal NetAmount { get; set; }
    public QuotationStatus Status { get; set; }
    public string? Notes { get; set; }
    public Guid? ConvertedSalesOrderId { get; set; }
    public string? ConvertedSalesOrderNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<QuotationItemResponse> Items { get; set; } = new();
}
