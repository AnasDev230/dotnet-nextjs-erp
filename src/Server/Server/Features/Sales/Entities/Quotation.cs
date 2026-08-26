using Server.Core.Common;
using Server.Features.Inventory;
using Server.Features.Sales.Enums;

namespace Server.Features.Sales.Entities;

public class Quotation : BaseEntity
{
    public string QuotationNumber { get; set; } = string.Empty;

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public DateTime QuotationDate { get; set; }

    public DateTime ExpiryDate { get; set; }

    public decimal Subtotal { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal NetAmount { get; set; }

    public QuotationStatus Status { get; set; } = QuotationStatus.Draft;

    public string? Notes { get; set; }

    public Guid? ConvertedSalesOrderId { get; set; }
    public SalesOrder? ConvertedSalesOrder { get; set; }

    public Guid? SentBy { get; set; }
    public DateTime? SentAt { get; set; }

    public Guid? RespondedBy { get; set; }
    public DateTime? RespondedAt { get; set; }

    public ICollection<QuotationItem> Items { get; set; } = new List<QuotationItem>();
}
