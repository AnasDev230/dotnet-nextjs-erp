namespace Server.Features.Inventory.Models;

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal ReorderLevel { get; set; }
    public decimal ReorderQty { get; set; }
    public decimal SalePrice { get; set; }
    public bool IsActive { get; set; }
}
