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
import { useTranslation } from "@/hooks/use-translation";
import type { ProductDetail } from "../types/product.types";

const unitKeys = [
  { value: "piece", labelKey: "inventory.products.unitPiece" },
  { value: "kg", labelKey: "inventory.products.unitKg" },
  { value: "liter", labelKey: "inventory.products.unitLiter" },
  { value: "box", labelKey: "inventory.products.unitBox" },
  { value: "meter", labelKey: "inventory.products.unitMeter" },
];

interface ProductFormProps {
  mode: "create" | "edit";
  product?: ProductDetail;
}

export default function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  const zodResolverTyped = zodResolver(productFormSchema) as Resolver<ProductFormData>;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;
  const { data: categories, isLoading: categoriesLoading } = useCategoriesForDropdown();

  const unitOptions = unitKeys.map((u) => ({ value: u.value, label: t(u.labelKey) }));

  const categoryOptions = [
    { value: "", label: t("inventory.products.withoutCategory") },
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
          {isEdit
            ? t("inventory.products.editTitle")
            : t("inventory.products.createTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>{t("common.error")}: {(error as any)?.response?.data?.message || error.message}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* SKU — disabled on edit */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                {isEdit
                  ? t("inventory.products.sku")
                  : `${t("inventory.products.sku")} *`}
              </Label>
              <Input
                id="sku"
                {...form.register("sku")}
                placeholder={t("inventory.products.enterSku")}
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
              <Label htmlFor="name">{t("inventory.products.name")} *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder={t("inventory.products.enterName")}
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
              <Label htmlFor="unitOfMeasure">{t("inventory.products.unitOfMeasure")} *</Label>
              <Select
                id="unitOfMeasure"
                {...form.register("unitOfMeasure")}
                options={unitOptions}
                placeholder={t("inventory.products.selectUnit")}
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
              <Label htmlFor="categoryId">{t("inventory.products.category")}</Label>
              {categoriesLoading ? (
                <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </div>
              ) : (
                <Select
                  id="categoryId"
                  {...form.register("categoryId")}
                  options={categoryOptions}
                  placeholder={t("inventory.products.selectCategory")}
                  className="h-10"
                />
              )}
            </div>

            {/* Reorder Level */}
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">{t("inventory.products.reorderLevel")}</Label>
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
              <Label htmlFor="reorderQty">{t("inventory.products.reorderQty")}</Label>
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
              <Label htmlFor="salePrice">{t("inventory.products.salePrice")} *</Label>
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
                <Label htmlFor="isActive">{t("inventory.products.status")}</Label>
                <select
                  id="isActive"
                  {...form.register("isActive")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="true">{t("common.active")}</option>
                  <option value="false">{t("common.inactive")}</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("common.description")}</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder={t("inventory.products.enterDescription")}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? t("common.saveChanges") : t("inventory.products.create")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/inventory/products")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
