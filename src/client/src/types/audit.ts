/** Audit action types (string values match backend JsonStringEnumConverter output) */
export enum AuditAction {
  Create = "Create",
  Update = "Update",
  Delete = "Delete",
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  userName?: string;
  action: AuditAction;
  actionName: string;
  tableName: string;
  recordId?: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AuditLogQueryParams {
  page?: number;
  pageSize?: number;
  action?: AuditAction;
  tableName?: string;
  userName?: string;
  fromDate?: string;
  toDate?: string;
}

export type AuditActionConfig = {
  labelKey: string;
  badgeClass: string;
};

/** Badge config for each action type */
export const AUDIT_ACTION_CONFIG: Record<AuditAction, AuditActionConfig> = {
  [AuditAction.Create]: {
    labelKey: "audit.action.create",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  [AuditAction.Update]: {
    labelKey: "audit.action.update",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  [AuditAction.Delete]: {
    labelKey: "audit.action.delete",
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};