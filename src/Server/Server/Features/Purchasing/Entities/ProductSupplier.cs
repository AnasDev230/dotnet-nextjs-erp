using Server.Core.Common;
using Server.Features.Inventory;

namespace Server.Features.Purchasing.Entities;

public class ProductSupplier : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid SupplierId { get; set; }
    public string? SupplierSku { get; set; }
    public int LeadTimeDays { get; set; }
    public decimal MinOrderQty { get; set; }
    public decimal UnitCost { get; set; }
    public bool IsPrimary { get; set; }

    public Product Product { get; set; } = null!;
    public Supplier Supplier { get; set; } = null!;
}
