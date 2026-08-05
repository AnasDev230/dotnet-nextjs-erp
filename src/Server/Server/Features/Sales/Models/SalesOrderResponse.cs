namespace Server.Features.Sales.Models;

public class SalesOrderResponse
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateOnly OrderDate { get; set; }
    public DateOnly? DeliveryDate { get; set; }
    public SalesOrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public decimal DiscountPct { get; set; }
    public decimal DiscountAmount { get; set; }
    public Guid? TaxRateId { get; set; }
    public string? TaxRateName { get; set; }
    public decimal TaxPct { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal NetAmount { get; set; }
    public decimal Subtotal { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<SalesOrderItemResponse> Items { get; set; } = new();
}
