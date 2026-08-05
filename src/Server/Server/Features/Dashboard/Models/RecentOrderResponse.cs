using Server.Features.Sales;
using Server.Features.Sales.Enums;

namespace Server.Features.Dashboard.Models;

public class RecentOrderResponse
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateOnly OrderDate { get; set; }
    public decimal NetAmount { get; set; }
    public SalesOrderStatus Status { get; set; }
}
