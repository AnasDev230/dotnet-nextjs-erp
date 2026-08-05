namespace Server.Features.Sales.Models;

public class TaxRateResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Rate { get; set; }
}
