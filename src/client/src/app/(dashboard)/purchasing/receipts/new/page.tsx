"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import GoodsReceiptForm from "@/features/purchasing/components/GoodsReceiptForm";
import { useTranslation } from "@/hooks/use-translation";

function CreateGoodsReceiptContent() {
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
            <h1 className="text-2xl font-semibold">
              {t("purchasing.receipts.createTitle")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("purchasing.receipts.createPageDescription")}
            </p>
          </div>
        </div>
      </div>

      <GoodsReceiptForm />
    </div>
  );
}

export default function CreateGoodsReceiptPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CreateGoodsReceiptContent />
    </Suspense>
  );
}
