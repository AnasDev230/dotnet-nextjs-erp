using Server.Core.Common;
using Server.Features.Sales.Enums;

namespace Server.Features.Sales;

public class Customer : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public CustomerType Type { get; set; } = CustomerType.Individual;
    public string? TaxNumber { get; set; }
    public decimal CreditLimit { get; set; }
    public int PaymentTerms { get; set; }
    public CustomerStatus Status { get; set; } = CustomerStatus.Active;
}
