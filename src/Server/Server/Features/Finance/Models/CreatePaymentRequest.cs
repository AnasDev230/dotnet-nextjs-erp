using Server.Features.Finance.Enums;

namespace Server.Features.Finance.Models;

public class CreatePaymentRequest
{
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}
