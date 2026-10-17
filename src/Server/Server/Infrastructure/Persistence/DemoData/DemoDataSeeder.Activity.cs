using Server.Core.Common;
using Server.Features.Audit.Entities;
using Server.Features.Audit.Enums;
using Server.Features.Notifications.Entities;
using Server.Features.Notifications.Enums;

namespace Server.Infrastructure.Persistence.DemoData;

public partial class DemoDataSeeder
{
    private void SeedNotifications()
    {
        if (_users.Count == 0)
            return;

        foreach (var user in _users)
        {
            var count = Int(8, 16);
            for (var i = 0; i < count; i++)
            {
                var type = (NotificationType)Int(0, 13);
                var createdAt = DateTimeBefore(29, 1);
                var isRead = Chance(55);

                _context.Notifications.Add(new Notification
                {
                    UserId = user.Id,
                    Type = type,
                    Title = DemoDataCatalog.NotificationTitles[(int)type],
                    Message = BuildNotificationMessage(type),
                    EntityId = ResolveNotificationEntityId(type),
                    IsRead = isRead,
                    ReadAt = isRead ? createdAt.AddHours(Int(1, 48)) : null,
                    CreatedAt = createdAt,
                    ExpiresAt = createdAt.AddDays(30)
                });
            }
        }
    }

    private Guid? ResolveNotificationEntityId(NotificationType type) => type switch
    {
        NotificationType.LowStock => PickId(_products),
        NotificationType.InvoiceDueSoon or NotificationType.InvoiceOverdue => PickId(_invoices),
        NotificationType.PurchaseOrderSubmitted or NotificationType.PurchaseOrderApproved => PickId(_purchaseOrders),
        NotificationType.SalesOrderConfirmed => PickId(_confirmedOrders),
        NotificationType.GoodsReceiptCompleted => PickId(_goodsReceipts),
        NotificationType.StockTransferApproved => PickId(_stockTransfers),
        NotificationType.SupplierInvoiceReceived => PickId(_supplierInvoices),
        NotificationType.LeaveRequestSubmitted or NotificationType.LeaveRequestApproved or NotificationType.LeaveRequestRejected => PickId(_leaveRequests),
        _ => null
    };

    private Guid? PickId<T>(IReadOnlyList<T> list) where T : BaseEntity =>
        list.Count > 0 ? Pick(list).Id : null;

    private string BuildNotificationMessage(NotificationType type) => type switch
    {
        NotificationType.LowStock => $"Stock for '{Pick(_products).Name}' has dropped to or below the reorder level.",
        NotificationType.InvoiceDueSoon => "An invoice is due within the next few days.",
        NotificationType.InvoiceOverdue => "An invoice is now overdue and requires follow-up.",
        NotificationType.PurchaseOrderSubmitted => "A purchase order has been submitted for approval.",
        NotificationType.PurchaseOrderApproved => "A purchase order has been approved.",
        NotificationType.SalesOrderConfirmed => "A new sales order has been confirmed.",
        NotificationType.GoodsReceiptCompleted => "A goods receipt has been completed.",
        NotificationType.StockTransferApproved => "A stock transfer has been approved.",
        NotificationType.SupplierInvoiceReceived => "A supplier invoice has been received.",
        NotificationType.LeaveRequestSubmitted => "An employee leave request is awaiting approval.",
        NotificationType.LeaveRequestApproved => "A leave request has been approved.",
        NotificationType.LeaveRequestRejected => "A leave request has been rejected.",
        _ => "System notification."
    };

    private void SeedAuditLogs()
    {
        var tableNames = new[]
        {
            "Products", "Customers", "Suppliers", "SalesOrders", "PurchaseOrders",
            "Invoices", "Payments", "Employees", "StockTransfers", "Quotations"
        };

        for (var i = 0; i < 150; i++)
        {
            _auditCounter++;
            var user = _users.Count > 0 ? Pick(_users) : null;
            var action = (AuditAction)Int(0, 3);
            var table = Pick(tableNames);
            var recordId = Guid.NewGuid();
            var timestamp = DateTimeBefore(60, 1);

            string? oldValues = action == AuditAction.Create
                ? null
                : Json("Status", Pick(new[] { "Draft", "Active", "Pending" }));
            string? newValues = action == AuditAction.Delete
                ? null
                : Json("Status", Pick(new[] { "Confirmed", "Approved", "Completed", "Paid" }));

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = user?.Id,
                UserName = user?.FullName ?? "System",
                Action = action,
                TableName = table,
                RecordId = recordId,
                OldValues = oldValues,
                NewValues = newValues,
                IpAddress = $"10.0.{Int(0, 255)}.{Int(1, 255)}",
                UserAgent = Pick(DemoDataCatalog.UserAgents),
                Timestamp = timestamp
            });
        }
    }
}
