"use client";

import { useParams } from "next/navigation";
import GoodsReceiptDetails from "@/features/purchasing/components/GoodsReceiptDetails";

export default function GoodsReceiptDetailPage() {
  const params = useParams<{ id: string }>();

  return <GoodsReceiptDetails receiptId={params.id} />;
}
