namespace Server.Features.Purchasing.Models;

public class UpdateProductSupplierRequest
{
    public string? SupplierSku { get; set; }
    public int LeadTimeDays { get; set; }
    public decimal MinOrderQty { get; set; }
    public decimal UnitCost { get; set; }
    public bool IsPrimary { get; set; }
}