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
import { Plus, AlertCircle } from "lucide-react";
import { Alert, Button, Label } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import SalesOrderItemRow from "./SalesOrderItemRow";
import type { ProductListItem } from "@/features/inventory/types/product.types";
import type {
  SalesOrderFormData,
  SalesOrderItemFormData,
} from "../schemas/sales-order.schema";

interface SalesOrderItemsEditorProps {
  control: Control<SalesOrderFormData>;
  register: UseFormRegister<SalesOrderFormData>;
  setValue: UseFormSetValue<SalesOrderFormData>;
  setError: UseFormSetError<SalesOrderFormData>;
  clearErrors: UseFormClearErrors<SalesOrderFormData>;
  errors: FieldErrors<SalesOrderFormData>;
  productOptions: { value: string; label: string }[];
  productById: (id: string) => ProductListItem | undefined;
  availableStockByProduct: Map<string, number>;
  warehouseSelected: boolean;
  isStockLoading: boolean;
}

export default function SalesOrderItemsEditor({
  control,
  register,
  setValue,
  setError,
  clearErrors,
  errors,
  productOptions,
  productById,
  availableStockByProduct,
  warehouseSelected,
  isStockLoading,
}: SalesOrderItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const items = useWatch<SalesOrderFormData, "items">({
    control,
    name: "items",
  });
  const [showCannotRemove, setShowCannotRemove] = useState(false);
  const { t } = useTranslation();

  const handleAdd = () => {
    append({ productId: "", quantity: 1, unitPrice: 0, discountPct: 0 });
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
        <Label className="text-base font-medium">{t("sales.orders.orderItems")}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-9 gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("sales.orders.addProduct")}
        </Button>
      </div>

      {showCannotRemove && (
        <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <p>{t("sales.orders.atLeastOneProduct")}</p>
        </Alert>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <SalesOrderItemRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            setValue={setValue}
            setError={setError}
            clearErrors={clearErrors}
            errors={errors}
            productOptions={productOptions}
            productById={productById}
            allItems={items}
            availableStockByProduct={availableStockByProduct}
            warehouseSelected={warehouseSelected}
            isStockLoading={isStockLoading}
            onRemove={() => handleRemove(index)}
            canRemove={fields.length > 1}
          />
        ))}
      </div>
    </div>
  );
}
