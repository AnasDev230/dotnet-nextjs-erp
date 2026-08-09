namespace Server.Features.Reports.Models;

public class PurchasesSummaryResponse
{
    public decimal TotalSpending { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public int TotalSuppliers { get; set; }
    public List<PurchasesByPeriodItem> ByPeriod { get; set; } = new();
    public List<TopSupplierItem> TopSuppliers { get; set; } = new();
}

public class PurchasesByPeriodItem
{
    public string Period { get; set; } = string.Empty;
    public decimal Spending { get; set; }
    public int OrderCount { get; set; }
}

public class TopSupplierItem
{
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int OrderCount { get; set; }
}