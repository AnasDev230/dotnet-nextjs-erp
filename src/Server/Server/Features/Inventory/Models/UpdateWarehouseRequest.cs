namespace Server.Features.Inventory.Models;

public class UpdateWarehouseRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public bool IsActive { get; set; }
}
