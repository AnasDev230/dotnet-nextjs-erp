"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui";
import PaymentForm from "@/features/finance/components/PaymentForm";
import { useTranslation } from "@/hooks/use-translation";

export default function NewPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowRight className="ml-2 h-4 w-4" />
          {t("finance.payments.back")}
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{t("finance.payments.recordTitle")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("finance.payments.recordSubtitle")}
          </p>
        </div>
      </div>

      <PaymentForm invoiceId={params.id} />
    </div>
  );
}
