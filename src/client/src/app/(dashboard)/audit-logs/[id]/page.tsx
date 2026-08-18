"use client";

import { useParams } from "next/navigation";
import AuditLogDetails from "@/features/audit/components/AuditLogDetails";

export default function AuditLogDetailPage() {
  const params = useParams<{ id: string }>();

  return <AuditLogDetails logId={params.id} />;
}