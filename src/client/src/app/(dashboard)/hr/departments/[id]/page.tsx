"use client";

import { useParams } from "next/navigation";
import DepartmentDetails from "@/features/hr/components/DepartmentDetails";

export default function DepartmentDetailPage() {
  const params = useParams<{ id: string }>();

  return <DepartmentDetails departmentId={params.id} />;
}