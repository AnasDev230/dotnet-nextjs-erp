"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import QuotationForm from "@/features/sales/components/QuotationForm";

export default function CreateQuotationPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("quotation.new")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("quotation.description")}
            </p>
          </div>
        </div>
      </div>

      <QuotationForm mode="create" />
    </div>
  );
}
