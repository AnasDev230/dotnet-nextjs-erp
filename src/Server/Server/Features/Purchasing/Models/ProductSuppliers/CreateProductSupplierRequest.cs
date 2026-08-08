namespace Server.Features.Purchasing.Models;

public class CreateProductSupplierRequest
{
    public Guid ProductId { get; set; }
    public Guid SupplierId { get; set; }
    public string? SupplierSku { get; set; }
    public int LeadTimeDays { get; set; }
    public decimal MinOrderQty { get; set; }
    public decimal UnitCost { get; set; }
    public bool IsPrimary { get; set; }
}