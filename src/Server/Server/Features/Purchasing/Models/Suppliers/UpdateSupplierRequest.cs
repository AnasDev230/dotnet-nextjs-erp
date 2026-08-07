namespace Server.Features.Purchasing.Models;

public class UpdateSupplierRequest
{
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? TaxNumber { get; set; }
    public int PaymentTerms { get; set; }
    public decimal Rating { get; set; }
}
