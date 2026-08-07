using Server.Core.Common;
using Server.Features.Inventory;

namespace Server.Features.Purchasing.Entities;

public class GoodsReceiptItem : BaseEntity
{
    public Guid GoodsReceiptId { get; set; }
    public Guid PoItemId { get; set; }
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }

    public GoodsReceipt GoodsReceipt { get; set; } = null!;
    public PoItem PoItem { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
