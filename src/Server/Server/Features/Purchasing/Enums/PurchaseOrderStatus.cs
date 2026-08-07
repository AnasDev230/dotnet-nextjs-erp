namespace Server.Features.Purchasing.Enums;

public enum PurchaseOrderStatus : byte
{
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    PartiallyReceived = 3,
    Received = 4,
    Cancelled = 5
}
