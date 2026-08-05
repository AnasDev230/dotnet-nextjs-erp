namespace Server.Features.Dashboard.Models;

public class DashboardStatsResponse
{
    // Sales
    public decimal TotalSalesAmount { get; set; }
    public int TotalSalesCount { get; set; }

    // Invoices
    public decimal TotalInvoicesAmount { get; set; }
    public int TotalInvoicesCount { get; set; }

    // Payments
    public decimal TotalPaidAmount { get; set; }

    // Outstanding (unpaid)
    public decimal TotalOutstandingAmount { get; set; }
    public int OverdueInvoicesCount { get; set; }

    // Inventory
    public int LowStockCount { get; set; }
    public int TotalProductsCount { get; set; }

    // Customers
    public int TotalCustomersCount { get; set; }
}
