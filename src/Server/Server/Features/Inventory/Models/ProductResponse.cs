namespace Server.Features.Inventory.Models;

public class ProductResponse
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal ReorderLevel { get; set; }
    public decimal ReorderQty { get; set; }
    public decimal SalePrice { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
