"use client";

import { useFieldArray } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { Alert, Button, Label } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import PurchaseReturnItemRow from "./PurchaseReturnItemRow";
import type { PurchaseReturnFormData } from "../schemas/purchase-return.schema";
import type { GrnItemResponse } from "../types/goods-receipt.types";

interface PurchaseReturnItemsEditorProps {
  control: Control<PurchaseReturnFormData>;
  register: UseFormRegister<PurchaseReturnFormData>;
  setValue: UseFormSetValue<PurchaseReturnFormData>;
  errors: FieldErrors<PurchaseReturnFormData>;
  receiptItems: GrnItemResponse[];
  unitCostByProduct: Map<string, number>;
  orderLoading: boolean;
  itemsAvailable: boolean;
}

export default function PurchaseReturnItemsEditor({
  control,
  register,
  setValue,
  errors,
  receiptItems,
  unitCostByProduct,
  orderLoading,
  itemsAvailable,
}: PurchaseReturnItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const { t } = useTranslation();

  const handleAdd = () => {
    append({
      productId: "",
      quantity: 1,
      unitCost: 0,
      maxQuantity: 0,
      reason: "",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{t("returns.items")}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!itemsAvailable}
          className="h-9 gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("returns.addItem")}
        </Button>
      </div>

      {!itemsAvailable && (
        <Alert className="border-blue-500/20 bg-blue-500/10 text-blue-600">
          <AlertCircle className="h-4 w-4" />
          <p>{t("returns.selectGoodsReceiptFirst")}</p>
        </Alert>
      )}

      {orderLoading && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("returns.loadingGoodsReceipt")}
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <PurchaseReturnItemRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            setValue={setValue}
            errors={errors}
            receiptItems={receiptItems}
            unitCostByProduct={unitCostByProduct}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
          />
        ))}
      </div>
    </div>
  );
}