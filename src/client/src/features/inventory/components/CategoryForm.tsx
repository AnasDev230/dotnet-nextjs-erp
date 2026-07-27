"use client";

import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Button,
  Alert,
} from "@/components/ui";
import {
  categoryFormSchema,
  type CategoryFormData,
} from "../schemas/category.schema";
import { useCreateCategory } from "../hooks/useCreateCategory";
import { useUpdateCategory } from "../hooks/useUpdateCategory";
import { useCategoriesForDropdown } from "../hooks/useCategoriesForDropdown";
import type { CategoryDetail } from "../types/category.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

interface CategoryFormProps {
  mode: "create" | "edit";
  category?: CategoryDetail;
}

export default function CategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const { data: allCategories } = useCategoriesForDropdown();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(category?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const zodResolverTyped = zodResolver(categoryFormSchema) as Resolver<CategoryFormData>;

  const form = useForm<CategoryFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      code: category?.code ?? "",
      name: category?.name ?? "",
      parentId: category?.parentId ?? "",
    },
  });

  const parentOptions = (allCategories ?? [])
    .filter((c) => c.id !== category?.id)
    .map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }));

  const onSubmit = async (data: CategoryFormData) => {
    const payload = {
      ...data,
      parentId: data.parentId || undefined,
    };

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          name: payload.name,
          parentId: payload.parentId,
        });
      } else {
        await createMutation.mutateAsync({
          code: data.code ?? "",
          name: payload.name,
          parentId: payload.parentId,
        });
      }
      router.push("/inventory/categories");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>حدث خطأ: {(error as AxiosError<ApiResponse<unknown>>)?.response?.data?.message || error.message}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Code — disabled on edit */}
            <div className="space-y-2">
              <Label htmlFor="code">{isEdit ? "الرمز" : "الرمز *"}</Label>
              <Input
                id="code"
                {...form.register("code")}
                placeholder="أدخل رمز التصنيف"
                className="h-10"
                disabled={isEdit}
              />
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  لا يمكن تعديل الرمز بعد الإنشاء
                </p>
              )}
              {form.formState.errors.code && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">اسم التصنيف *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="أدخل اسم التصنيف"
                className="h-10"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Parent Category */}
            <div className="space-y-2">
              <Label htmlFor="parentId">التصنيف الأب</Label>
              <select
                id="parentId"
                {...form.register("parentId")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">بدون تصنيف أب</option>
                {parentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? "حفظ التغييرات" : "إضافة التصنيف"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/inventory/categories")}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
