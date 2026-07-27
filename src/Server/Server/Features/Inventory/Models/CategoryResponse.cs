namespace Server.Features.Inventory.Models;

public class CategoryResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public string? ParentName { get; set; }
    public int ProductsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
