namespace Server.Features.Sales.Models;

public class SalesOrderListItemResponse
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateOnly OrderDate { get; set; }
    public SalesOrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal NetAmount { get; set; }
    public int ItemsCount { get; set; }
}
