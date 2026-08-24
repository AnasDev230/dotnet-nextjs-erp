namespace Server.Features.Notifications.Enums;

public enum NotificationType : byte
{
    LowStock = 0,
    InvoiceDueSoon = 1,
    InvoiceOverdue = 2,
    PurchaseOrderSubmitted = 3,
    PurchaseOrderApproved = 4,
    SalesOrderConfirmed = 5,
    GoodsReceiptCompleted = 6,
    StockTransferApproved = 7,
    SupplierInvoiceReceived = 8,
    System = 9
}
