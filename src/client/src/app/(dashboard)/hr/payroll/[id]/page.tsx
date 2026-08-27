"use client";

import { useParams } from "next/navigation";
import PayrollRunDetail from "@/features/hr/components/payroll/PayrollRunDetail";

export default function PayrollRunDetailPage() {
  const params = useParams<{ id: string }>();

  return <PayrollRunDetail runId={params.id} />;
}
