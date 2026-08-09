namespace Server.Features.Reports.Models;

public class SalesSummaryResponse
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public int TotalCustomers { get; set; }
    public List<SalesByPeriodItem> ByPeriod { get; set; } = new();
    public List<TopCustomerItem> TopCustomers { get; set; } = new();
}

public class SalesByPeriodItem
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class TopCustomerItem
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int OrderCount { get; set; }
}