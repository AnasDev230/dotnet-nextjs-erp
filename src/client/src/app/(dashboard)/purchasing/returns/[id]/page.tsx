"use client";

import PurchaseReturnDetails from "@/features/purchasing/components/PurchaseReturnDetails";

export default function PurchaseReturnDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <PurchaseReturnDetails purchaseReturnId={params.id} />;
}