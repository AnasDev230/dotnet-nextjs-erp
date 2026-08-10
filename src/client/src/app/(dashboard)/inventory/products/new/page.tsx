"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import ProductForm from "@/features/inventory/components/ProductForm";
import { useTranslation } from "@/hooks/use-translation";

export default function CreateProductPage() {
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
            <h1 className="text-2xl font-semibold">{t("inventory.products.createTitle")}</h1>
            <p className="text-muted-foreground text-sm">{t("inventory.products.createPageDescription")}</p>
          </div>
        </div>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
