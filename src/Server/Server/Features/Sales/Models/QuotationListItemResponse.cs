using Server.Features.Sales.Enums;

namespace Server.Features.Sales.Models;

public class QuotationListItemResponse
{
    public Guid Id { get; set; }
    public string QuotationNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateTime QuotationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal NetAmount { get; set; }
    public QuotationStatus Status { get; set; }
}
