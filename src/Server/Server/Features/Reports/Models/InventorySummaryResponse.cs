namespace Server.Features.Reports.Models;

public class InventorySummaryResponse
{
    public int TotalProducts { get; set; }
    public int TotalWarehouses { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int LowStockCount { get; set; }
    public List<StockByWarehouseItem> ByWarehouse { get; set; } = new();
    public List<LowStockItem> LowStockItems { get; set; } = new();
}

public class StockByWarehouseItem
{
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public decimal TotalValue { get; set; }
}

public class LowStockItem
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public decimal QuantityOnHand { get; set; }
    public decimal ReorderLevel { get; set; }
}