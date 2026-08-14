"use client";

import { useParams } from "next/navigation";
import EmployeeDetails from "@/features/hr/components/EmployeeDetails";

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();

  return <EmployeeDetails employeeId={params.id} />;
}