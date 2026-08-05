using Server.Core.Common;

namespace Server.Features.Finance;

public class Payment : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Invoice Invoice { get; set; } = null!;
}
