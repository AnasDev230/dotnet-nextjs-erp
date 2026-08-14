"use client";

import { useParams } from "next/navigation";
import WarehouseDetails from "@/features/inventory/components/WarehouseDetails";

export default function WarehouseDetailPage() {
  const params = useParams<{ id: string }>();

  return <WarehouseDetails warehouseId={params.id} />;
}
