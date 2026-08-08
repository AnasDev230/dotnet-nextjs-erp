"use client";

import { useParams } from "next/navigation";
import SupplierDetails from "@/features/purchasing/components/SupplierDetails";

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();

  return <SupplierDetails supplierId={params.id} />;
}
