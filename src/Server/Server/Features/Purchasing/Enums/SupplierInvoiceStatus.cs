namespace Server.Features.Purchasing.Enums;

public enum SupplierInvoiceStatus : byte
{
    Draft = 0,
    Received = 1,
    PartiallyPaid = 2,
    Paid = 3,
    Cancelled = 4
}