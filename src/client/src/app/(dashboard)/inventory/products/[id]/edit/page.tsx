"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import ProductForm from "@/features/inventory/components/ProductForm";
import { useProduct } from "@/features/inventory/hooks/useProduct";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
            <h1 className="text-2xl font-semibold">المنتج غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على المنتج المطلوب
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
            <h1 className="text-2xl font-semibold">تعديل المنتج</h1>
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
