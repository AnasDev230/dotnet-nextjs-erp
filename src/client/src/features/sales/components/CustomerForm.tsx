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
  Select,
  Alert,
} from "@/components/ui";
import {
  customerFormSchema,
  type CustomerFormData,
} from "../schemas/customer.schema";
import { useCreateCustomer } from "../hooks/useCreateCustomer";
import { useUpdateCustomer } from "../hooks/useUpdateCustomer";
import type { CustomerDetail } from "../types/customer.types";

const typeOptions = [
  { value: "Individual", label: "فرد" },
  { value: "Company", label: "شركة" },
];

const statusOptions = [
  { value: "Active", label: "نشط" },
  { value: "Suspended", label: "موقوف" },
];

interface CustomerFormProps {
  mode: "create" | "edit";
  customer?: CustomerDetail;
}

export default function CustomerForm({ mode, customer }: CustomerFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer(customer?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const zodResolverTyped = zodResolver(customerFormSchema) as Resolver<CustomerFormData>;

  const form = useForm<CustomerFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      code: customer?.code ?? "",
      name: customer?.name ?? "",
      type: customer?.type ?? "Individual",
      taxNumber: customer?.taxNumber ?? "",
      creditLimit: customer?.creditLimit ?? 0,
      paymentTerms: customer?.paymentTerms ?? 0,
      status: customer?.status ?? "Active",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEdit && customer) {
        await updateMutation.mutateAsync({
          name: data.name,
          type: data.type,
          taxNumber: data.taxNumber || undefined,
          creditLimit: data.creditLimit ?? 0,
          paymentTerms: data.paymentTerms ?? 0,
          status: data.status ?? "Active",
        });
      } else {
        await createMutation.mutateAsync({
          code: data.code ?? "",
          name: data.name,
          type: data.type,
          taxNumber: data.taxNumber || undefined,
          creditLimit: data.creditLimit ?? 0,
          paymentTerms: data.paymentTerms ?? 0,
        });
      }
      router.push("/sales/customers");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? "تعديل العميل" : "إضافة عميل جديد"}
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
            {/* Code — disabled on edit */}
            <div className="space-y-2">
              <Label htmlFor="code">{isEdit ? "الرمز" : "الرمز *"}</Label>
              <Input
                id="code"
                {...form.register("code")}
                placeholder="أدخل رمز العميل"
                className="h-10"
                disabled={isEdit}
              />
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  لا يمكن تعديل الرمز بعد الإنشاء
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
              <Label htmlFor="name">اسم العميل *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="أدخل اسم العميل"
                className="h-10"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">نوع العميل *</Label>
              <Select
                id="type"
                {...form.register("type")}
                options={typeOptions}
                placeholder="اختر نوع العميل"
                className="h-10"
              />
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            {/* Tax Number */}
            <div className="space-y-2">
              <Label htmlFor="taxNumber">الرقم الضريبي</Label>
              <Input
                id="taxNumber"
                {...form.register("taxNumber")}
                placeholder="أدخل الرقم الضريبي (اختياري)"
                className="h-10"
              />
              {form.formState.errors.taxNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.taxNumber.message}
                </p>
              )}
            </div>

            {/* Credit Limit */}
            <div className="space-y-2">
              <Label htmlFor="creditLimit">حد الائتمان</Label>
              <Input
                id="creditLimit"
                type="number"
                step="0.01"
                {...form.register("creditLimit", { valueAsNumber: true })}
                placeholder="0.00"
                className="h-10"
              />
              {form.formState.errors.creditLimit && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.creditLimit.message}
                </p>
              )}
            </div>

            {/* Payment Terms */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">شروط الدفع (أيام)</Label>
              <Input
                id="paymentTerms"
                type="number"
                step="1"
                {...form.register("paymentTerms", { valueAsNumber: true })}
                placeholder="0"
                className="h-10"
              />
              {form.formState.errors.paymentTerms && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.paymentTerms.message}
                </p>
              )}
            </div>

            {/* Status — edit only */}
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="status">حالة العميل *</Label>
                <Select
                  id="status"
                  {...form.register("status")}
                  options={statusOptions}
                  placeholder="اختر الحالة"
                  className="h-10"
                />
                {form.formState.errors.status && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? "حفظ التغييرات" : "إضافة العميل"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/sales/customers")}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
