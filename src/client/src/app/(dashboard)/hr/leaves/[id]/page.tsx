"use client";

import { useParams } from "next/navigation";
import LeaveDetails from "@/features/hr/components/leaves/LeaveDetails";

export default function LeaveDetailsPage() {
  const params = useParams<{ id: string }>();

  return <LeaveDetails leaveId={params.id} />;
}
