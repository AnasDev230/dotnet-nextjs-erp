"use client";

import { useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormClearErrors,
  type UseFormRegister,
  type UseFormSetError,
  type UseFormSetValue,
} from "react-hook-form";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, Button, Input, Label } from "@/components/ui";
import { formatCurrency } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { ProductListItem } from "@/features/inventory/types/product.types";
import type {
  PurchaseOrderFormData,
  PoItemFormData,
} from "../schemas/purchase-order.schema";

interface PurchaseOrderItemsEditorProps {
  control: Control<PurchaseOrderFormData>;
  register: UseFormRegister<PurchaseOrderFormData>;
  setValue: UseFormSetValue<PurchaseOrderFormData>;
  setError: UseFormSetError<PurchaseOrderFormData>;
  clearErrors: UseFormClearErrors<PurchaseOrderFormData>;
  errors: FieldErrors<PurchaseOrderFormData>;
  productOptions: { value: string; label: string }[];
  productById: (id: string) => ProductListItem | undefined;
}

export default function PurchaseOrderItemsEditor({
  control,
  register,
  setValue,
  setError,
  clearErrors,
  errors,
  productOptions,
  productById,
}: PurchaseOrderItemsEditorProps) {
  const { t, language } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const items = useWatch<PurchaseOrderFormData, "items">({
    control,
    name: "items",
  });
  const [showCannotRemove, setShowCannotRemove] = useState(false);

  const handleAdd = () => {
    append({ productId: "", quantity: 1, unitPrice: 0 });
  };

  const handleRemove = (index: number) => {
    if (fields.length <= 1) {
      setShowCannotRemove(true);
      setTimeout(() => setShowCannotRemove(false), 3000);
      return;
    }
    remove(index);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{t("purchasing.orders.orderItems")}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-9 gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("purchasing.orders.addProduct")}
        </Button>
      </div>

      {showCannotRemove && (
        <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <p>{t("purchasing.orders.atLeastOneProduct")}</p>
        </Alert>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const watchedItem = items[index];
          const productId = watchedItem?.productId ?? "";
          const quantity = Number(watchedItem?.quantity ?? 0);
          const unitPrice = Number(watchedItem?.unitPrice ?? 0);
          const lineTotal = quantity * unitPrice;
          const itemErrors = errors.items?.[index];

          const handleProductChange = (
            event: React.ChangeEvent<HTMLSelectElement>
          ) => {
            const selectedId = event.target.value;
            setValue(`items.${index}.productId`, selectedId);

            if (!selectedId) {
              setValue(`items.${index}.unitPrice`, 0);
              return;
            }

            const isDuplicate = items.some(
              (item, i) => i !== index && item.productId === selectedId
            );

            if (isDuplicate) {
              setError(`items.${index}.productId`, {
                type: "manual",
                message: t("purchasing.orders.duplicateProduct"),
              });
              return;
            }

            clearErrors(`items.${index}.productId`);

            const product = productById(selectedId);
            if (product) {
              const existingUnitPrice = Number(watchedItem?.unitPrice ?? 0);
              setValue(
                `items.${index}.unitPrice`,
                existingUnitPrice > 0
                  ? existingUnitPrice
                  : product.salePrice,
                { shouldValidate: true }
              );
            }
          };

          return (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <Label htmlFor={`items.${index}.productId`} className="text-xs">
                  {t("purchasing.orders.product")}
                </Label>
                <select
                  id={`items.${index}.productId`}
                  value={productId}
                  onChange={handleProductChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t("common.selectProduct")}</option>
                  {productOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {itemErrors?.productId && (
                  <p className="text-sm text-destructive">
                    {itemErrors.productId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`items.${index}.quantity`} className="text-xs">
                  {t("common.quantity")}
                </Label>
                <Input
                  id={`items.${index}.quantity`}
                  type="number"
                  min={1}
                  step="0.001"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  className="h-10"
                />
                {itemErrors?.quantity && (
                  <p className="text-sm text-destructive">
                    {itemErrors.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`items.${index}.unitPrice`} className="text-xs">
                  {t("purchasing.orders.unitPrice")}
                </Label>
                <Input
                  id={`items.${index}.unitPrice`}
                  type="number"
                  min={0}
                  step="0.01"
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                  className="h-10"
                />
                {itemErrors?.unitPrice && (
                  <p className="text-sm text-destructive">
                    {itemErrors.unitPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs">{t("purchasing.orders.lineTotal")}</Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium">
                  {formatCurrency(lineTotal, language)}
                </div>
              </div>

              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-destructive"
                  onClick={() => handleRemove(index)}
                  disabled={fields.length <= 1}
                  title={fields.length > 1 ? t("common.deleteRow") : t("common.cannotDeleteLastRow")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
