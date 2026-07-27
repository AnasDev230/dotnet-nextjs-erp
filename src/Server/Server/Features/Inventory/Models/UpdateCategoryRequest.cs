namespace Server.Features.Inventory.Models;

public class UpdateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
}
