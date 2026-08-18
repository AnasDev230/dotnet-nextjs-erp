namespace Server.Features.Inventory.Enums;

public enum StockTransferStatus : byte
{
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    Completed = 3,
    Cancelled = 4
}
