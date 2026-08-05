"use client";

import { useParams } from "next/navigation";
import InvoiceDetails from "@/features/finance/components/InvoiceDetails";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();

  return <InvoiceDetails invoiceId={params.id} />;
}
