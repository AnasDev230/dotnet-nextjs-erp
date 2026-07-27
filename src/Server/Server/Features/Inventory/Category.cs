using Server.Core.Common;

namespace Server.Features.Inventory;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public Category? Parent { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
