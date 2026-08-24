export enum NotificationType {
  LowStock = 0,
  InvoiceDueSoon = 1,
  InvoiceOverdue = 2,
  PurchaseOrderSubmitted = 3,
  PurchaseOrderApproved = 4,
  SalesOrderConfirmed = 5,
  GoodsReceiptCompleted = 6,
  StockTransferApproved = 7,
  SupplierInvoiceReceived = 8,
  System = 9,
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { icon: string; colorClass: string }
> = {
  [NotificationType.LowStock]: { icon: "AlertTriangle", colorClass: "text-amber-600 bg-amber-500/10" },
  [NotificationType.InvoiceDueSoon]: { icon: "Clock", colorClass: "text-amber-600 bg-amber-500/10" },
  [NotificationType.InvoiceOverdue]: { icon: "AlertCircle", colorClass: "text-red-600 bg-red-500/10" },
  [NotificationType.PurchaseOrderSubmitted]: { icon: "FileText", colorClass: "text-blue-600 bg-blue-500/10" },
  [NotificationType.PurchaseOrderApproved]: { icon: "CheckCircle", colorClass: "text-emerald-600 bg-emerald-500/10" },
  [NotificationType.SalesOrderConfirmed]: { icon: "ShoppingCart", colorClass: "text-blue-600 bg-blue-500/10" },
  [NotificationType.GoodsReceiptCompleted]: { icon: "Package", colorClass: "text-emerald-600 bg-emerald-500/10" },
  [NotificationType.StockTransferApproved]: { icon: "ArrowLeftRight", colorClass: "text-blue-600 bg-blue-500/10" },
  [NotificationType.SupplierInvoiceReceived]: { icon: "Receipt", colorClass: "text-amber-600 bg-amber-500/10" },
  [NotificationType.System]: { icon: "Info", colorClass: "text-slate-600 bg-slate-500/10" },
};
