namespace Server.Features.Purchasing.Models;

public class UpdateSupplierInvoiceRequest
{
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public string? Notes { get; set; }
    public string? SupplierReference { get; set; }
}