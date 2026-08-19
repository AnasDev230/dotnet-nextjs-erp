"use client";

import { useParams } from "next/navigation";
import SupplierInvoiceForm from "@/features/purchasing/components/SupplierInvoiceForm";

export default function EditSupplierInvoicePage() {
  const params = useParams<{ id: string }>();

  return <SupplierInvoiceForm mode="edit" invoiceId={params.id} />;
}