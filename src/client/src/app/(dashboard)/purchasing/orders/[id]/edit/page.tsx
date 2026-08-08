"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import PurchaseOrderForm from "@/features/purchasing/components/PurchaseOrderForm";
import { usePurchaseOrder } from "@/features/purchasing/hooks/usePurchaseOrder";

export default function EditPurchaseOrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading, error } = usePurchaseOrder(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">أمر الشراء غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على أمر الشراء المطلوب
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">تعديل أمر الشراء</h1>
            <p className="text-muted-foreground text-sm">
              <span className="font-mono">{order.poNumber}</span>
            </p>
          </div>
        </div>
      </div>

      <PurchaseOrderForm mode="edit" order={order} />
    </div>
  );
}
