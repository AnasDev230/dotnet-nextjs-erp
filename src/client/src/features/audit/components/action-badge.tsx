"use client";

import { Pencil, PlusCircle, Trash2, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { AUDIT_ACTION_CONFIG, AuditAction } from "@/types/audit";

const actionIcons: Record<AuditAction, LucideIcon> = {
  [AuditAction.Create]: PlusCircle,
  [AuditAction.Update]: Pencil,
  [AuditAction.Delete]: Trash2,
};

export function ActionBadge({ action }: { action: AuditAction }) {
  const { t } = useTranslation();
  const config = AUDIT_ACTION_CONFIG[action];
  const Icon = actionIcons[action];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}
    >
      <Icon className="h-3 w-3" />
      {t(config.labelKey)}
    </span>
  );
}