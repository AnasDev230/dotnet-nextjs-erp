"use client";

import { useParams } from "next/navigation";
import PurchaseOrderDetails from "@/features/purchasing/components/PurchaseOrderDetails";

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();

  return <PurchaseOrderDetails orderId={params.id} />;
}
