"use client";

import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormClearErrors,
  type UseFormRegister,
  type UseFormSetError,
  type UseFormSetValue,
} from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import type { ProductListItem } from "@/features/inventory/types/product.types";
import type {
  SalesOrderFormData,
  SalesOrderItemFormData,
} from "../schemas/sales-order.schema";

interface SalesOrderItemRowProps {
  index: number;
  control: Control<SalesOrderFormData>;
  register: UseFormRegister<SalesOrderFormData>;
  setValue: UseFormSetValue<SalesOrderFormData>;
  setError: UseFormSetError<SalesOrderFormData>;
  clearErrors: UseFormClearErrors<SalesOrderFormData>;
  errors: FieldErrors<SalesOrderFormData>;
  productOptions: { value: string; label: string }[];
  productById: (id: string) => ProductListItem | undefined;
  allItems: SalesOrderItemFormData[];
  onRemove: () => void;
  canRemove: boolean;
}

export default function SalesOrderItemRow({
  index,
  control,
  register,
  setValue,
  setError,
  clearErrors,
  errors,
  productOptions,
  productById,
  allItems,
  onRemove,
  canRemove,
}: SalesOrderItemRowProps) {
  const watchedItem = useWatch<SalesOrderFormData, `items.${number}`>({
    control,
    name: `items.${index}`,
  });

  const quantity = Number(watchedItem?.quantity ?? 0);
  const unitPrice = Number(watchedItem?.unitPrice ?? 0);
  const discountPct = Number(watchedItem?.discountPct ?? 0);
  const lineTotal = quantity * unitPrice * (1 - discountPct / 100);
  const itemErrors = errors.items?.[index];

  const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = event.target.value;
    setValue(`items.${index}.productId`, productId);

    if (!productId) {
      setValue(`items.${index}.unitPrice`, 0);
      return;
    }

    const isDuplicate = allItems.some(
      (item, i) => i !== index && item.productId === productId
    );

    if (isDuplicate) {
      setError(`items.${index}.productId`, {
        type: "manual",
        message: "لا يمكن تكرار نفس المنتج في نفس الأمر",
      });
      return;
    }

    clearErrors(`items.${index}.productId`);

    const product = productById(productId);
    if (product) {
      setValue(`items.${index}.unitPrice`, product.salePrice, {
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto]">
      <div className="space-y-2">
        <Label htmlFor={`items.${index}.productId`} className="text-xs">
          المنتج
        </Label>
        <select
          id={`items.${index}.productId`}
          value={watchedItem?.productId ?? ""}
          onChange={handleProductChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">اختر المنتج</option>
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
          الكمية
        </Label>
        <Input
          id={`items.${index}.quantity`}
          type="number"
          min={1}
          step={1}
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
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
          سعر الوحدة
        </Label>
        <Input
          id={`items.${index}.unitPrice`}
          type="number"
          min={0}
          step="0.01"
          {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
          className="h-10"
        />
        {itemErrors?.unitPrice && (
          <p className="text-sm text-destructive">
            {itemErrors.unitPrice.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`items.${index}.discountPct`} className="text-xs">
          الخصم %
        </Label>
        <Input
          id={`items.${index}.discountPct`}
          type="number"
          min={0}
          max={100}
          step={1}
          {...register(`items.${index}.discountPct`, { valueAsNumber: true })}
          className="h-10"
        />
        {itemErrors?.discountPct && (
          <p className="text-sm text-destructive">
            {itemErrors.discountPct.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs">الإجمالي</Label>
        <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium">
          {lineTotal.toLocaleString("ar-SA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          ر.س
        </div>
      </div>

      <div className="flex items-end justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-destructive"
          onClick={onRemove}
          disabled={!canRemove}
          title={canRemove ? "حذف السطر" : "لا يمكن حذف آخر سطر"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
