using Server.Core.Common;
using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Entities;

public class PurchaseOrder : BaseEntity
{
    public string PoNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public DateOnly OrderDate { get; set; }
    public DateOnly? ExpectedDate { get; set; }
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "SAR";
    public string? Terms { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public Supplier Supplier { get; set; } = null!;
    public ICollection<PoItem> Items { get; set; } = new List<PoItem>();
    public ICollection<GoodsReceipt> GoodsReceipts { get; set; } = new List<GoodsReceipt>();
    public ICollection<SupplierInvoice> SupplierInvoices { get; set; } = new List<SupplierInvoice>();
}
