namespace Server.Features.Purchasing.Models;

public class CreateSupplierInvoiceRequest
{
    public Guid PurchaseOrderId { get; set; }
    public Guid SupplierId { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public string? Notes { get; set; }
    public string? SupplierReference { get; set; }
}