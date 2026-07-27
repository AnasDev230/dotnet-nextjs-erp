using Server.Core.Common;

namespace Server.Features.Inventory;

public class Product : BaseEntity
{
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal ReorderLevel { get; set; }
    public decimal ReorderQty { get; set; }
    public bool IsActive { get; set; } = true;
}
