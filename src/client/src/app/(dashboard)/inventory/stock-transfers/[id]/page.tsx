"use client";

import { useParams } from "next/navigation";
import StockTransferDetails from "@/features/inventory/components/StockTransferDetails";

export default function StockTransferDetailPage() {
  const params = useParams<{ id: string }>();
  return <StockTransferDetails transferId={params.id} />;
}