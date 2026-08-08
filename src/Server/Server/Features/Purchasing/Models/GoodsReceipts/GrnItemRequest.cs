namespace Server.Features.Purchasing.Models;

public class GrnItemRequest
{
    public Guid PoItemId { get; set; }
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
}