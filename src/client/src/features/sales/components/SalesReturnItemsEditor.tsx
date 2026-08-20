"use client";

import { useFieldArray } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { Alert, Button, Label } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import SalesReturnItemRow from "./SalesReturnItemRow";
import type { SalesReturnFormData } from "../schemas/sales-return.schema";
import type { SalesOrderItemResponse } from "../types/sales-order.types";

interface SalesReturnItemsEditorProps {
  control: Control<SalesReturnFormData>;
  register: UseFormRegister<SalesReturnFormData>;
  setValue: UseFormSetValue<SalesReturnFormData>;
  errors: FieldErrors<SalesReturnFormData>;
  orderItems: SalesOrderItemResponse[];
  orderLoading: boolean;
  itemsAvailable: boolean;
}

export default function SalesReturnItemsEditor({
  control,
  register,
  setValue,
  errors,
  orderItems,
  orderLoading,
  itemsAvailable,
}: SalesReturnItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const { t } = useTranslation();

  const handleAdd = () => {
    append({
      productId: "",
      quantity: 1,
      unitPrice: 0,
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
          <p>{t("returns.selectInvoiceFirst")}</p>
        </Alert>
      )}

      {orderLoading && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("returns.loadingInvoice")}
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <SalesReturnItemRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            setValue={setValue}
            errors={errors}
            orderItems={orderItems}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
          />
        ))}
      </div>
    </div>
  );
}