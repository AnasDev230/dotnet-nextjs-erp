"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Alert, Button } from "@/components/ui";
import SalesOrderForm from "@/features/sales/components/SalesOrderForm";
import { useSalesOrder } from "@/features/sales/hooks/useSalesOrder";
import { useTranslation } from "@/hooks/use-translation";

export default function EditSalesOrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
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
            <h1 className="text-2xl font-semibold">{t("sales.orders.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("sales.orders.notFoundDescription")}
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
              {t("sales.orders.editTitle")} {order.orderNumber}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("sales.orders.editPageDescription")}
            </p>
          </div>
        </div>
      </div>

      {order.status !== "Draft" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <p>{t("sales.orders.cannotEditConfirmed")}</p>
        </Alert>
      )}

      <SalesOrderForm mode="edit" order={order} />
    </div>
  );
}
