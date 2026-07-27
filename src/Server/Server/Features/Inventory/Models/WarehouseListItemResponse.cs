namespace Server.Features.Inventory.Models;

public class WarehouseListItemResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
