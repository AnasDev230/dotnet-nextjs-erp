"use client";

import { useParams } from "next/navigation";
import SupplierInvoiceDetails from "@/features/purchasing/components/SupplierInvoiceDetails";

export default function SupplierInvoiceDetailPage() {
  const params = useParams<{ id: string }>();

  return <SupplierInvoiceDetails invoiceId={params.id} />;
}