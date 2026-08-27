"use client";

import { useParams } from "next/navigation";
import PaySlip from "@/features/hr/components/payroll/PaySlip";

export default function PaySlipPage() {
  const params = useParams<{ id: string; detailId: string }>();

  return <PaySlip runId={params.id} detailId={params.detailId} />;
}
