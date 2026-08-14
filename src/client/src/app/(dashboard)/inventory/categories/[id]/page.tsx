"use client";

import { useParams } from "next/navigation";
import CategoryDetails from "@/features/inventory/components/CategoryDetails";

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();

  return <CategoryDetails categoryId={params.id} />;
}
