using Server.Core.Common;
using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Entities;

public class SupplierInvoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;

    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;

    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    public DateTime IssueDate { get; set; }

    public DateTime DueDate { get; set; }

    public decimal Subtotal { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal NetAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public SupplierInvoiceStatus Status { get; set; } = SupplierInvoiceStatus.Draft;

    public string? Notes { get; set; }

    public string? SupplierReference { get; set; }

    public ICollection<PurchasePayment> Payments { get; set; } = new List<PurchasePayment>();
}