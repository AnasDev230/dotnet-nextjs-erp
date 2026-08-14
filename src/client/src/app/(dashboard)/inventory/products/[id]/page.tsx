"use client";

import { useParams } from "next/navigation";
import ProductDetails from "@/features/inventory/components/ProductDetails";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();

  return <ProductDetails productId={params.id} />;
}
