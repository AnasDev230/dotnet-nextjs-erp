"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import ProductSuppliersTable from "@/features/purchasing/components/ProductSuppliersTable";
import { useProductSuppliersByProduct } from "@/features/purchasing/hooks/useProductSuppliersByProduct";

function ProductSuppliersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") ?? undefined;

  const { data, isLoading } = useProductSuppliersByProduct(productId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">ربط المنتجات بالموردين</h1>
          <p className="text-muted-foreground text-sm">
            حدد الموردين لكل منتج وتكلفة الشراء
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(
              productId
                ? `/purchasing/product-suppliers/new?productId=${productId}`
                : "/purchasing/product-suppliers/new"
            )
          }
        >
          <Plus className="ml-2 h-4 w-4" />
          ربط جديد
        </Button>
      </div>

      <ProductSuppliersTable
        links={data ?? []}
        isLoading={isLoading}
        title="لا توجد روابط"
        emptyMessage={
          productId
            ? "لا توجد روابط لهذا المنتج بعد"
            : "اختر منتجاً من خلال فلاتر البحث أو أنشئ رابطاً جديداً"
        }
      />
    </div>
  );
}

export default function ProductSuppliersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProductSuppliersContent />
    </Suspense>
  );
}
