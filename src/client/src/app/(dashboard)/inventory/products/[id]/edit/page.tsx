"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import ProductForm from "@/features/inventory/components/ProductForm";
import { useProduct } from "@/features/inventory/hooks/useProduct";
import { useTranslation } from "@/hooks/use-translation";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: product, isLoading, error } = useProduct(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("inventory.products.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("inventory.products.notFoundDescription")}
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
            <h1 className="text-2xl font-semibold">{t("inventory.products.editTitle")}</h1>
            <p className="text-muted-foreground text-sm">
              {product.sku} — {product.name}
            </p>
          </div>
        </div>
      </div>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}
