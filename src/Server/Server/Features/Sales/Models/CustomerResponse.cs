namespace Server.Features.Sales.Models;

public class CustomerResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public CustomerType Type { get; set; }
    public string? TaxNumber { get; set; }
    public decimal CreditLimit { get; set; }
    public int PaymentTerms { get; set; }
    public CustomerStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
