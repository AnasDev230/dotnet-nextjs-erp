using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Models;

public class SupplierInvoiceListItemResponse
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string PurchaseOrderNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal NetAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public SupplierInvoiceStatus Status { get; set; }
}