export enum QuotationStatus {
  Draft = 0,
  Sent = 1,
  Accepted = 2,
  Rejected = 3,
  Expired = 4,
  Converted = 5,
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
}

export interface QuotationDetail {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  quotationDate: string;
  expiryDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  status: QuotationStatus;
  notes: string | null;
  convertedSalesOrderId: string | null;
  convertedSalesOrderNumber: string | null;
  createdAt: string;
  items: QuotationItem[];
}

export interface QuotationListItem {
  id: string;
  quotationNumber: string;
  customerName: string;
  quotationDate: string;
  expiryDate: string;
  netAmount: number;
  status: QuotationStatus;
}

export interface CreateQuotationRequest {
  customerId: string;
  quotationDate: string;
  expiryDate: string;
  discountAmount: number;
  taxAmount: number;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
  }[];
}

export interface UpdateQuotationRequest {
  quotationDate: string;
  expiryDate: string;
  discountAmount: number;
  taxAmount: number;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
  }[];
}

interface BadgeConfig {
  labelKey: string;
  badgeVariant:
    | "neutral"
    | "info"
    | "success"
    | "destructive"
    | "warning"
    | "default";
}

export const QUOTATION_STATUS_CONFIG: Record<QuotationStatus, BadgeConfig> = {
  [QuotationStatus.Draft]: {
    labelKey: "quotation.status.draft",
    badgeVariant: "neutral",
  },
  [QuotationStatus.Sent]: {
    labelKey: "quotation.status.sent",
    badgeVariant: "info",
  },
  [QuotationStatus.Accepted]: {
    labelKey: "quotation.status.accepted",
    badgeVariant: "success",
  },
  [QuotationStatus.Rejected]: {
    labelKey: "quotation.status.rejected",
    badgeVariant: "destructive",
  },
  [QuotationStatus.Expired]: {
    labelKey: "quotation.status.expired",
    badgeVariant: "warning",
  },
  [QuotationStatus.Converted]: {
    labelKey: "quotation.status.converted",
    badgeVariant: "default",
  },
};

const QUOTATION_STATUS_BY_NAME: Record<string, QuotationStatus> = {
  Draft: QuotationStatus.Draft,
  Sent: QuotationStatus.Sent,
  Accepted: QuotationStatus.Accepted,
  Rejected: QuotationStatus.Rejected,
  Expired: QuotationStatus.Expired,
  Converted: QuotationStatus.Converted,
};

export function normalizeQuotationStatus(
  status: QuotationStatus | string | number
): QuotationStatus {
  if (typeof status === "string") {
    if (status in QUOTATION_STATUS_BY_NAME) return QUOTATION_STATUS_BY_NAME[status];
    const num = Number(status);
    if (!isNaN(num) && num in QUOTATION_STATUS_CONFIG) return num as QuotationStatus;
    return QuotationStatus.Draft;
  }
  return status as QuotationStatus;
}

export function getQuotationStatusConfig(
  status: QuotationStatus | string | number
): BadgeConfig {
  const normalized = normalizeQuotationStatus(status);
  return QUOTATION_STATUS_CONFIG[normalized] ?? QUOTATION_STATUS_CONFIG[QuotationStatus.Draft];
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
