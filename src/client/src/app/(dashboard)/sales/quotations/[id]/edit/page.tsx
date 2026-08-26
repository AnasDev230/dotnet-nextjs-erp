"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import QuotationForm from "@/features/sales/components/QuotationForm";
import { useQuotation } from "@/features/sales/hooks/useQuotations";
import { QuotationStatus } from "@/features/sales/types/quotation.types";
import { useTranslation } from "@/hooks/use-translation";

export default function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  const { data: quotation, isLoading } = useQuotation(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quotation || quotation.status !== QuotationStatus.Draft) {
    router.push(`/sales/quotations/${id}`);
    return null;
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
              {t("quotation.editTitle")}
            </h1>
            <p className="text-muted-foreground text-sm font-mono text-xs">
              {quotation.quotationNumber}
            </p>
          </div>
        </div>
      </div>

      <QuotationForm mode="edit" quotation={quotation} />
    </div>
  );
}
