using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Models;

public class SupplierInvoiceResponse
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid PurchaseOrderId { get; set; }
    public string PurchaseOrderNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal NetAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public SupplierInvoiceStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? SupplierReference { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PurchasePaymentResponse> Payments { get; set; } = new();
}