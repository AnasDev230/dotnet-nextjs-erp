"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Button,
  Select,
  Textarea,
} from "@/components/ui";
import {
  quotationFormSchema,
  type QuotationFormData,
} from "../schemas/quotation.schema";
import { useCreateQuotation, useUpdateQuotation } from "../hooks/useQuotations";
import { useCustomersForDropdown } from "../hooks/useCustomersForDropdown";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import type { QuotationDetail } from "../types/quotation.types";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";

interface QuotationFormProps {
  mode: "create" | "edit";
  quotation?: QuotationDetail;
}

export default function QuotationForm({ mode, quotation }: QuotationFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const { t, language } = useTranslation();

  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation(quotation?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: customers } = useCustomersForDropdown();
  const { data: products } = useProducts({ page: 1, pageSize: 200 });

  const todayStr = new Date().toISOString().slice(0, 10);

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema) as Resolver<QuotationFormData>,
    defaultValues: isEdit && quotation
      ? {
          customerId: quotation.customerId,
          quotationDate: quotation.quotationDate.slice(0, 10),
          expiryDate: quotation.expiryDate.slice(0, 10),
          discountAmount: quotation.discountAmount,
          taxAmount: quotation.taxAmount,
          notes: quotation.notes ?? "",
          items: quotation.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent,
          })),
        }
      : {
          customerId: "",
          quotationDate: todayStr,
          expiryDate: "",
          discountAmount: 0,
          taxAmount: 0,
          notes: "",
          items: [
            { productId: "", quantity: 1, unitPrice: 0, discountPercent: 0 },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");
  const discountAmount = form.watch("discountAmount") ?? 0;
  const taxAmount = form.watch("taxAmount") ?? 0;

  const subtotal =
    items?.reduce(
      (sum, item) =>
        sum +
        (item.quantity || 0) *
          (item.unitPrice || 0) *
          (1 - (item.discountPercent || 0) / 100),
      0
    ) ?? 0;
  const netAmount = subtotal - discountAmount + taxAmount;

  const handleProductChange = (index: number, productId: string) => {
    form.setValue(`items.${index}.productId`, productId);
    const product = products?.items.find((p) => p.id === productId);
    if (product && !isEdit) {
      const current = form.getValues(`items.${index}.unitPrice`);
      if (!current) form.setValue(`items.${index}.unitPrice`, product.salePrice);
    }
  };

  const onSubmit = async (data: QuotationFormData) => {
    try {
      if (isEdit && quotation) {
        await updateMutation.mutateAsync({
          quotationDate: data.quotationDate,
          expiryDate: data.expiryDate,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          notes: data.notes || undefined,
          items: data.items,
        });
        router.push(`/sales/quotations/${quotation.id}`);
      } else {
        const created = await createMutation.mutateAsync({
          customerId: data.customerId,
          quotationDate: data.quotationDate,
          expiryDate: data.expiryDate,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          notes: data.notes || undefined,
          items: data.items,
        });
        router.push(`/sales/quotations/${created.id}`);
      }
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("quotation.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerId">{t("quotation.customer")} *</Label>
              <Select
                id="customerId"
                {...form.register("customerId")}
                options={(customers ?? []).map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                placeholder={t("quotation.selectCustomer")}
                className="h-10"
                disabled={isPending}
              />
              {form.formState.errors.customerId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.customerId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotationDate">{t("quotation.quotationDate")} *</Label>
              <Input
                id="quotationDate"
                type="date"
                {...form.register("quotationDate")}
                className="h-10"
              />
              {form.formState.errors.quotationDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.quotationDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">{t("quotation.expiryDate")} *</Label>
              <Input
                id="expiryDate"
                type="date"
                {...form.register("expiryDate")}
                className="h-10"
              />
              {form.formState.errors.expiryDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.expiryDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">{t("quotation.notes")}</Label>
              <Textarea
                id="notes"
                rows={3}
                {...form.register("notes")}
                className="resize-none"
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("quotation.items")}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              append({
                productId: "",
                quantity: 1,
                unitPrice: 0,
                discountPercent: 0,
              })
            }
          >
            <Plus className="h-4 w-4" />
            {t("quotation.addItem")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.formState.errors.items?.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.items.root.message}
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 md:grid-cols-12 items-start rounded-lg border border-border p-4"
            >
              <div className="space-y-2 md:col-span-4">
                <Label>{t("quotation.product")} *</Label>
                <Select
                  {...form.register(`items.${index}.productId`)}
                  value={form.watch(`items.${index}.productId`)}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  options={(products?.items ?? []).map((product) => ({
                    value: product.id,
                    label: `${product.name} (${product.sku})`,
                  }))}
                  placeholder={t("quotation.selectProduct")}
                  className="h-10"
                />
                {form.formState.errors.items?.[index]?.productId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.items[index]?.productId?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{t("quotation.quantity")} *</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  {...form.register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  className="h-10 tabular-nums"
                />
                {form.formState.errors.items?.[index]?.quantity && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{t("quotation.unitPrice")} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                  className="h-10 tabular-nums"
                />
                {form.formState.errors.items?.[index]?.unitPrice && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.items[index]?.unitPrice?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{t("quotation.discountPercent")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...form.register(`items.${index}.discountPercent`, {
                    valueAsNumber: true,
                  })}
                  className="h-10 tabular-nums"
                />
                {form.formState.errors.items?.[index]?.discountPercent && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.items[index]?.discountPercent?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2 flex md:flex-col justify-between md:items-end">
                <Label className="text-muted-foreground text-xs">
                  {t("quotation.lineTotal")}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums h-10 flex items-center">
                    {formatCurrency(
                      (form.watch(`items.${index}.quantity`) || 0) *
                        (form.watch(`items.${index}.unitPrice`) || 0) *
                        (1 - (form.watch(`items.${index}.discountPercent`) || 0) / 100),
                      language
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                    aria-label={t("quotation.removeItem")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discountAmount">{t("quotation.discountAmount")}</Label>
              <Input
                id="discountAmount"
                type="number"
                step="0.01"
                min="0"
                {...form.register("discountAmount", { valueAsNumber: true })}
                className="h-10 tabular-nums"
              />
              {form.formState.errors.discountAmount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.discountAmount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxAmount">{t("quotation.taxAmount")}</Label>
              <Input
                id="taxAmount"
                type="number"
                step="0.01"
                min="0"
                {...form.register("taxAmount", { valueAsNumber: true })}
                className="h-10 tabular-nums"
              />
              {form.formState.errors.taxAmount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.taxAmount.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-muted/40 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("quotation.subtotal")}</span>
              <span className="tabular-nums">{formatCurrency(subtotal, language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("quotation.discountAmount")}
              </span>
              <span className="tabular-nums">
                −{formatCurrency(discountAmount, language)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("quotation.taxAmount")}</span>
              <span className="tabular-nums">+{formatCurrency(taxAmount, language)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>{t("quotation.netAmount")}</span>
              <span className="tabular-nums">
                {formatCurrency(netAmount, language)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-border mt-6">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? t("common.saveChanges") : t("common.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/sales/quotations")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
