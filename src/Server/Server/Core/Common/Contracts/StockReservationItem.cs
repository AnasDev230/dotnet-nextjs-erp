namespace Server.Core.Common.Contracts;

public class StockReservationItem
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
}
