using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Models;

public class PurchasePaymentResponse
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public PurchasePaymentMethod Method { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}