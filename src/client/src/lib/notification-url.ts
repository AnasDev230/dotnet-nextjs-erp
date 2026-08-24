import { NotificationType } from "@/types/notification";

/**
 * Frontend constructs navigation URLs from Type + EntityId.
 * Backend does NOT know or store frontend routes.
 * If routes change, ONLY this file needs updating.
 */
export function getNotificationUrl(
  type: NotificationType,
  entityId?: string
): string | null {
  if (!entityId) return null;

  const urlMap: Record<NotificationType, (id: string) => string> = {
    [NotificationType.LowStock]: (id) => `/inventory/products/${id}`,
    [NotificationType.InvoiceDueSoon]: (id) => `/sales/invoices/${id}`,
    [NotificationType.InvoiceOverdue]: (id) => `/sales/invoices/${id}`,
    [NotificationType.PurchaseOrderSubmitted]: (id) => `/purchasing/orders/${id}`,
    [NotificationType.PurchaseOrderApproved]: (id) => `/purchasing/orders/${id}`,
    [NotificationType.SalesOrderConfirmed]: (id) => `/sales/orders/${id}`,
    [NotificationType.GoodsReceiptCompleted]: (id) =>
      `/purchasing/goods-receipts/${id}`,
    [NotificationType.StockTransferApproved]: (id) =>
      `/inventory/stock-transfers/${id}`,
    [NotificationType.SupplierInvoiceReceived]: (id) =>
      `/purchasing/supplier-invoices/${id}`,
    [NotificationType.System]: () => `/`,
  };

  const builder = urlMap[type];
  return builder ? builder(entityId) : null;
}
