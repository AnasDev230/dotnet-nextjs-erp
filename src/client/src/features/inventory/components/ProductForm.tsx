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
  Textarea,
  Select,
  Alert,
} from "@/components/ui";
import {
  productFormSchema,
  type ProductFormData,
} from "../schemas/product.schema";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { useUpdateProduct } from "../hooks/useUpdateProduct";
import { useCategoriesForDropdown } from "../hooks/useCategoriesForDropdown";
import type { ProductDetail } from "../types/product.types";

const unitOptions = [
  { value: "piece", label: "قطعة" },
  { value: "kg", label: "كيلوغرام" },
  { value: "liter", label: "لتر" },
  { value: "box", label: "كرتونة" },
  { value: "meter", label: "متر" },
];

interface ProductFormProps {
  mode: "create" | "edit";
  product?: ProductDetail;
}

export default function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const zodResolverTyped = zodResolver(productFormSchema) as Resolver<ProductFormData>;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;
  const { data: categories, isLoading: categoriesLoading } = useCategoriesForDropdown();

  const categoryOptions = [
    { value: "", label: "بدون تصنيف" },
    ...(categories ?? []).map((c) => ({
      value: c.id,
      label: `${c.code} — ${c.name}`,
    })),
  ];

  const form = useForm<ProductFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      sku: product?.sku ?? "",
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      unitOfMeasure: product?.unitOfMeasure ?? "",
      reorderLevel: product?.reorderLevel ?? 0,
      reorderQty: product?.reorderQty ?? 0,
      salePrice: product?.salePrice ?? 0,
      isActive: product?.isActive ?? true,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    const payload = {
      ...data,
      categoryId: data.categoryId || null,
    };

    try {
      if (isEdit && product) {
        await updateMutation.mutateAsync({
          name: payload.name,
          description: payload.description || undefined,
          categoryId: payload.categoryId ?? undefined,
          unitOfMeasure: payload.unitOfMeasure,
          reorderLevel: payload.reorderLevel,
          reorderQty: payload.reorderQty,
          salePrice: payload.salePrice ?? 0,
          isActive: payload.isActive ?? true,
        });
      } else {
        await createMutation.mutateAsync({
          sku: data.sku ?? "",
          name: payload.name,
          description: payload.description || undefined,
          categoryId: payload.categoryId ?? undefined,
          unitOfMeasure: payload.unitOfMeasure,
          reorderLevel: payload.reorderLevel,
          reorderQty: payload.reorderQty,
          salePrice: payload.salePrice ?? 0,
        });
      }
      router.push("/inventory/products");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>حدث خطأ: {(error as any)?.response?.data?.message || error.message}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* SKU — disabled on edit */}
            <div className="space-y-2">
              <Label htmlFor="sku">{isEdit ? "رمز المنتج" : "رمز المنتج *"}</Label>
              <Input
                id="sku"
                {...form.register("sku")}
                placeholder="أدخل رمز المنتج"
                className="h-10"
                disabled={isEdit}
              />
              {form.formState.errors.sku && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.sku.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">اسم المنتج *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="أدخل اسم المنتج"
                className="h-10"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Unit of Measure */}
            <div className="space-y-2">
              <Label htmlFor="unitOfMeasure">وحدة القياس *</Label>
              <Select
                id="unitOfMeasure"
                {...form.register("unitOfMeasure")}
                options={unitOptions}
                placeholder="اختر وحدة القياس"
                className="h-10"
              />
              {form.formState.errors.unitOfMeasure && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.unitOfMeasure.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">التصنيف</Label>
              {categoriesLoading ? (
                <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التحميل...
                </div>
              ) : (
                <Select
                  id="categoryId"
                  {...form.register("categoryId")}
                  options={categoryOptions}
                  placeholder="اختر التصنيف"
                  className="h-10"
                />
              )}
            </div>

            {/* Reorder Level */}
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">مستوى إعادة الطلب</Label>
              <Input
                id="reorderLevel"
                type="number"
                step="0.001"
                {...form.register("reorderLevel", { valueAsNumber: true })}
                placeholder="0"
                className="h-10"
              />
              {form.formState.errors.reorderLevel && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reorderLevel.message}
                </p>
              )}
            </div>

            {/* Reorder Qty */}
            <div className="space-y-2">
              <Label htmlFor="reorderQty">كمية إعادة الطلب</Label>
              <Input
                id="reorderQty"
                type="number"
                step="0.001"
                {...form.register("reorderQty", { valueAsNumber: true })}
                placeholder="0"
                className="h-10"
              />
              {form.formState.errors.reorderQty && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reorderQty.message}
                </p>
              )}
            </div>

            {/* Sale Price */}
            <div className="space-y-2">
              <Label htmlFor="salePrice">سعر البيع *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                {...form.register("salePrice", { valueAsNumber: true })}
                placeholder="0.00"
                className="h-10"
              />
              {form.formState.errors.salePrice && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.salePrice.message}
                </p>
              )}
            </div>

            {/* IsActive — edit only */}
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="isActive">الحالة</Label>
                <select
                  id="isActive"
                  {...form.register("isActive")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="وصف المنتج (اختياري)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? "حفظ التغييرات" : "إضافة المنتج"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/inventory/products")}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
