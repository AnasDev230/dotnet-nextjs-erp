"use client";

import SalesReturnDetails from "@/features/sales/components/SalesReturnDetails";

export default function SalesReturnDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <SalesReturnDetails salesReturnId={params.id} />;
}