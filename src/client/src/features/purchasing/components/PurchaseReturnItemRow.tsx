"use client";

import { useWatch } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";
import type { PurchaseReturnFormData } from "../schemas/purchase-return.schema";
import type { GrnItemResponse } from "../types/goods-receipt.types";

interface PurchaseReturnItemRowProps {
  index: number;
  control: Control<PurchaseReturnFormData>;
  register: UseFormRegister<PurchaseReturnFormData>;
  setValue: UseFormSetValue<PurchaseReturnFormData>;
  errors: FieldErrors<PurchaseReturnFormData>;
  receiptItems: GrnItemResponse[];
  unitCostByProduct: Map<string, number>;
  onRemove: () => void;
  canRemove: boolean;
}

export default function PurchaseReturnItemRow({
  index,
  control,
  register,
  setValue,
  errors,
  receiptItems,
  unitCostByProduct,
  onRemove,
  canRemove,
}: PurchaseReturnItemRowProps) {
  const { t, language } = useTranslation();
  const watchedItem = useWatch<PurchaseReturnFormData, `items.${number}`>({
    control,
    name: `items.${index}`,
  });

  const productId = watchedItem?.productId ?? "";
  const quantity = Number(watchedItem?.quantity ?? 0);
  const unitCost = Number(watchedItem?.unitCost ?? 0);
  const maxQuantity = Number(watchedItem?.maxQuantity ?? 0);
  const lineTotal = quantity * unitCost;
  const itemErrors = errors.items?.[index];

  const receiptItemOptions = receiptItems.map((item) => ({
    value: item.productId,
    label: `${item.productSku} — ${item.productName}`,
  }));

  const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = event.target.value;
    const item = receiptItems.find((o) => o.productId === productId);

    setValue(`items.${index}.productId`, productId);
    setValue(`items.${index}.productName`, item?.productName ?? "");
    setValue(`items.${index}.productSku`, item?.productSku ?? "");
    setValue(`items.${index}.maxQuantity`, item?.quantity ?? 0);
    setValue(
      `items.${index}.unitCost`,
      unitCostByProduct.get(productId) ?? 0
    );
  };

  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto]">
        {/* Product */}
        <div className="space-y-2">
          <Label htmlFor={`items.${index}.productId`} className="text-xs">
            {t("returns.product")}
          </Label>
          <select
            id={`items.${index}.productId`}
            value={watchedItem?.productId ?? ""}
            onChange={handleProductChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{t("returns.product")}</option>
            {receiptItemOptions.map((opt) => (
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
          {productId && maxQuantity > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("returns.maxQuantity")}:{" "}
              <span className="font-medium tabular-nums">{maxQuantity}</span>
            </p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor={`items.${index}.quantity`} className="text-xs">
            {t("returns.quantity")}
          </Label>
          <Input
            id={`items.${index}.quantity`}
            type="number"
            min={0}
            step="0.001"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            className="h-10"
          />
          {itemErrors?.quantity && (
            <p className="text-sm text-destructive">
              {itemErrors.quantity.message}
            </p>
          )}
        </div>

        {/* Unit Cost */}
        <div className="space-y-2">
          <Label htmlFor={`items.${index}.unitCost`} className="text-xs">
            {t("returns.unitCost")}
          </Label>
          <Input
            id={`items.${index}.unitCost`}
            type="number"
            min={0}
            step="0.01"
            readOnly
            {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
            className="h-10"
          />
          {itemErrors?.unitCost && (
            <p className="text-sm text-destructive">
              {itemErrors.unitCost.message}
            </p>
          )}
        </div>

        {/* Line Total */}
        <div className="space-y-2">
          <Label className="text-xs">{t("returns.lineTotal")}</Label>
          <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium">
            {formatCurrency(lineTotal, language)}
          </div>
        </div>

        {/* Remove */}
        <div className="flex items-end justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-destructive"
            onClick={onRemove}
            disabled={!canRemove}
            title={t("returns.removeItem")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Item reason */}
      <div className="space-y-2">
        <Label htmlFor={`items.${index}.reason`} className="text-xs">
          {t("returns.itemReason")}
        </Label>
        <Input
          id={`items.${index}.reason`}
          {...register(`items.${index}.reason`)}
          className="h-9"
        />
      </div>
    </div>
  );
}