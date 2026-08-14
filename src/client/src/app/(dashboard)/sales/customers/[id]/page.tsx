"use client";

import { useParams } from "next/navigation";
import CustomerDetails from "@/features/sales/components/CustomerDetails";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();

  return <CustomerDetails customerId={params.id} />;
}