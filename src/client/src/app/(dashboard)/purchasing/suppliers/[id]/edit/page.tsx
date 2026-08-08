"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import SupplierForm from "@/features/purchasing/components/SupplierForm";
import { useSupplier } from "@/features/purchasing/hooks/useSupplier";

export default function EditSupplierPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: supplier, isLoading, error } = useSupplier(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">المورد غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على المورد المطلوب
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
            <h1 className="text-2xl font-semibold">تعديل المورد</h1>
            <p className="text-muted-foreground text-sm">
              {supplier.code} — {supplier.name}
            </p>
          </div>
        </div>
      </div>

      <SupplierForm mode="edit" supplier={supplier} />
    </div>
  );
}
