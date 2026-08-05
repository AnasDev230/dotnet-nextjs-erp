using Server.Features.Sales.Enums;

namespace Server.Features.Sales.Models;

public class UpdateSalesOrderRequest
{
    public Guid CustomerId { get; set; }
    public Guid WarehouseId { get; set; }
    public DateOnly OrderDate { get; set; }
    public DateOnly? DeliveryDate { get; set; }
    public SalesOrderStatus Status { get; set; }
    public string? Notes { get; set; }
    public decimal DiscountPct { get; set; }
    public Guid? TaxRateId { get; set; }
    public List<SalesOrderItemRequest> Items { get; set; } = new();
}
