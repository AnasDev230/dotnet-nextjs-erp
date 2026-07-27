namespace Server.Features.Inventory.Models;

public class CreateWarehouseRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
}
