"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import ProductSupplierForm from "@/features/purchasing/components/ProductSupplierForm";
import { useTranslation } from "@/hooks/use-translation";

function CreateProductSupplierContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const productId = searchParams.get("productId") ?? undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("purchasing.productSuppliers.createTitle")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("purchasing.productSuppliers.createPageDescription")}
            </p>
          </div>
        </div>
      </div>

      <ProductSupplierForm preSelectedProductId={productId} />
    </div>
  );
}

export default function CreateProductSupplierPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CreateProductSupplierContent />
    </Suspense>
  );
}
