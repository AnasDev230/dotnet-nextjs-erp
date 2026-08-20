"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import { RETURN_STATUS_CONFIG } from "@/types/returns";
import type { ReturnStatus } from "@/types/returns";

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  const { t } = useTranslation();
  const config = RETURN_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.badgeClass}>
      {t(config.labelKey)}
    </Badge>
  );
}