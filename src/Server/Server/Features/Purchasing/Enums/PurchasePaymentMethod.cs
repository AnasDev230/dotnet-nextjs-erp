namespace Server.Features.Purchasing.Enums;

public enum PurchasePaymentMethod : byte
{
    Cash = 0,
    BankTransfer = 1,
    Card = 2,
    Cheque = 3
}