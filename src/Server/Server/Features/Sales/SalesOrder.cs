using Server.Core.Common;

namespace Server.Features.Sales;

public class SalesOrder : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public DateOnly OrderDate { get; set; }
    public DateOnly? DeliveryDate { get; set; }
    public SalesOrderStatus Status { get; set; } = SalesOrderStatus.Draft;
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }

    // Phase 2 — Discounts & Tax
    public decimal DiscountPct { get; set; }
    public decimal DiscountAmount { get; set; }
    public Guid? TaxRateId { get; set; }
    public decimal TaxPct { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal NetAmount { get; set; }

    // Navigation
    public Customer Customer { get; set; } = null!;
    public TaxRate? TaxRate { get; set; }
    public ICollection<SalesOrderItem> Items { get; set; } = new List<SalesOrderItem>();
}
