namespace Server.Features.Inventory.Models;

public class CategoryListItemResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ParentName { get; set; }
    public int ProductsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
