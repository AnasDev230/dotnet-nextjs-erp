"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Alert, Button } from "@/components/ui";
import SalesOrderForm from "@/features/sales/components/SalesOrderForm";
import { useSalesOrder } from "@/features/sales/hooks/useSalesOrder";

export default function EditSalesOrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading, error } = useSalesOrder(params.id);

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
            <h1 className="text-2xl font-semibold">أمر البيع غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على أمر البيع المطلوب
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
            <h1 className="text-2xl font-semibold">
              تعديل أمر البيع {order.orderNumber}
            </h1>
            <p className="text-muted-foreground text-sm">
              تعديل بيانات أمر البيع
            </p>
          </div>
        </div>
      </div>

      {order.status !== "Draft" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <p>هذا الأمر مؤكد ولا يمكن تعديله</p>
        </Alert>
      )}

      <SalesOrderForm mode="edit" order={order} />
    </div>
  );
}
