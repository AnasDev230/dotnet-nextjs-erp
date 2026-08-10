"use client";

import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin } from "lucide-react";
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
  warehouseFormSchema,
  type WarehouseFormData,
} from "../schemas/warehouse.schema";
import { useCreateWarehouse } from "../hooks/useCreateWarehouse";
import { useUpdateWarehouse } from "../hooks/useUpdateWarehouse";
import type { WarehouseDetail } from "../types/warehouse.types";
import { useTranslation } from "@/hooks/use-translation";

interface WarehouseFormProps {
  mode: "create" | "edit";
  warehouse?: WarehouseDetail;
}

export default function WarehouseForm({ mode, warehouse }: WarehouseFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse(warehouse?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const zodResolverTyped = zodResolver(warehouseFormSchema) as Resolver<WarehouseFormData>;

  const form = useForm<WarehouseFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      code: warehouse?.code ?? "",
      name: warehouse?.name ?? "",
      location: warehouse?.location ?? "",
      isActive: warehouse?.isActive ?? true,
    },
  });

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      if (isEdit && warehouse) {
        await updateMutation.mutateAsync({
          name: data.name,
          location: data.location || undefined,
          isActive: data.isActive ?? true,
        });
      } else {
        await createMutation.mutateAsync({
          code: data.code ?? "",
          name: data.name,
          location: data.location || undefined,
        });
      }
      router.push("/inventory/warehouses");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? t("inventory.warehouses.editTitle") : t("inventory.warehouses.createTitle")}
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
            {/* Code — disabled on edit */}
            <div className="space-y-2">
              <Label htmlFor="code">{isEdit ? t("common.code") : `${t("common.code")} *`}</Label>
              <Input
                id="code"
                {...form.register("code")}
                placeholder={t("inventory.warehouses.enterCode")}
                className="h-10"
                disabled={isEdit}
              />
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  {t("inventory.warehouses.codeUneditable")}
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
              <Label htmlFor="name">{t("inventory.warehouses.name")} *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder={t("inventory.warehouses.enterName")}
                className="h-10"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">{t("inventory.warehouses.location")}</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  {...form.register("location")}
                  placeholder={t("inventory.warehouses.enterLocation")}
                  className="h-10 pr-10"
                />
              </div>
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>
          </div>

          {/* IsActive Switch (edit only) */}
          {isEdit && (
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Label htmlFor="isActive" className="cursor-pointer">
                {t("inventory.warehouses.status")}
              </Label>
              <button
                id="isActive"
                type="button"
                role="switch"
                aria-checked={form.watch("isActive")}
                onClick={() => {
                  const current = form.getValues("isActive");
                  form.setValue("isActive", !current, { shouldValidate: true });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  form.watch("isActive") ? "bg-emerald-500" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                    form.watch("isActive") ? "translate-x-0" : "-translate-x-6"
                  }`}
                />
              </button>
              <span className="text-sm text-muted-foreground">
                {form.watch("isActive") ? t("common.active") : t("common.inactive")}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? t("common.saveChanges") : t("inventory.warehouses.create")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/inventory/warehouses")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
