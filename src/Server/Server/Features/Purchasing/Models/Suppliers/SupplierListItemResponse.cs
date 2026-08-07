using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Models;

public class SupplierListItemResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public int PaymentTerms { get; set; }
    public decimal Rating { get; set; }
    public SupplierStatus Status { get; set; }
}
