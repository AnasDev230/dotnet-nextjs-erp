using Server.Core.Common;
using Server.Features.Finance;
using Server.Features.Inventory;
using Server.Features.Sales.Enums;

namespace Server.Features.Sales;

public class SalesOrder : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public Guid WarehouseId { get; set; }
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
    public Warehouse Warehouse { get; set; } = null!;
    public TaxRate? TaxRate { get; set; }
    public ICollection<SalesOrderItem> Items { get; set; } = new List<SalesOrderItem>();

    // Navigation — one-to-one with the invoice generated from this order
    public Invoice? Invoice { get; set; }
}
