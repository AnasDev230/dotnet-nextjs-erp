using Server.Core.Common;
using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Entities;

public class Supplier : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? TaxNumber { get; set; }
    public int PaymentTerms { get; set; }
    public decimal Rating { get; set; }
    public SupplierStatus Status { get; set; } = SupplierStatus.Active;

    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    public ICollection<ProductSupplier> ProductSuppliers { get; set; } = new List<ProductSupplier>();
}
