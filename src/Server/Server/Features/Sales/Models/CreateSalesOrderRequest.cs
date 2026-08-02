namespace Server.Features.Sales.Models;

public class CreateSalesOrderRequest
{
    public Guid CustomerId { get; set; }
    public DateOnly OrderDate { get; set; }
    public DateOnly? DeliveryDate { get; set; }
    public string? Notes { get; set; }
    public List<SalesOrderItemRequest> Items { get; set; } = new();
}
