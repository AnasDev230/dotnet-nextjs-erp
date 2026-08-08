namespace Server.Features.Purchasing.Models;

public class ProductSupplierResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string SupplierCode { get; set; } = string.Empty;
    public string? SupplierSku { get; set; }
    public int LeadTimeDays { get; set; }
    public decimal MinOrderQty { get; set; }
    public decimal UnitCost { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; }
}