"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import { LeaveStatus } from "@/types/leave";

const statusBadgeVariant: Record<
  LeaveStatus,
  "warning" | "success" | "destructive" | "neutral"
> = {
  [LeaveStatus.Pending]: "warning",
  [LeaveStatus.Approved]: "success",
  [LeaveStatus.Rejected]: "destructive",
  [LeaveStatus.Cancelled]: "neutral",
};

const statusLabelKey: Record<LeaveStatus, string> = {
  [LeaveStatus.Pending]: "leave.status.pending",
  [LeaveStatus.Approved]: "leave.status.approved",
  [LeaveStatus.Rejected]: "leave.status.rejected",
  [LeaveStatus.Cancelled]: "leave.status.cancelled",
};

export const leaveTypeLabelKey: Record<string, string> = {
  Annual: "leave.type.annual",
  Sick: "leave.type.sick",
  Unpaid: "leave.type.unpaid",
  Maternity: "leave.type.maternity",
  Emergency: "leave.type.emergency",
  Other: "leave.type.other",
};

export default function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const { t } = useTranslation();
  return (
    <Badge variant={statusBadgeVariant[status]}>
      {t(statusLabelKey[status])}
    </Badge>
  );
}
