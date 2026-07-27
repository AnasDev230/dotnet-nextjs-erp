"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import CategoryForm from "@/features/inventory/components/CategoryForm";
import { useCategory } from "@/features/inventory/hooks/useCategory";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: category, isLoading, error } = useCategory(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">التصنيف غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على التصنيف المطلوب
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
            <h1 className="text-2xl font-semibold">تعديل التصنيف</h1>
            <p className="text-muted-foreground text-sm">
              {category.code} — {category.name}
            </p>
          </div>
        </div>
      </div>

      <CategoryForm mode="edit" category={category} />
    </div>
  );
}
