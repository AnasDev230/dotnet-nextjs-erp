using Server.Core.Common;
using Server.Features.Purchasing.Enums;

namespace Server.Features.Purchasing.Entities;

public class PurchasePayment : BaseEntity
{
    public Guid SupplierInvoiceId { get; set; }
    public SupplierInvoice SupplierInvoice { get; set; } = null!;

    public decimal Amount { get; set; }

    public PurchasePaymentMethod Method { get; set; }

    public DateTime PaymentDate { get; set; }

    public string? Reference { get; set; }

    public string? Notes { get; set; }
}