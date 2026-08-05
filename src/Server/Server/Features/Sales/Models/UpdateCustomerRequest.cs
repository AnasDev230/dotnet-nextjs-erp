using Server.Features.Sales.Enums;

namespace Server.Features.Sales.Models;

public class UpdateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public CustomerType Type { get; set; }
    public string? TaxNumber { get; set; }
    public decimal CreditLimit { get; set; }
    public int PaymentTerms { get; set; }
    public CustomerStatus Status { get; set; }
}
