namespace Server.Features.Sales.Enums;

public enum ReturnStatus : byte
{
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    Completed = 3,
    Cancelled = 4
}