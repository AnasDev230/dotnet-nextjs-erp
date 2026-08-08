"use client";

import { useEffect } from "react";
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
  Alert,
} from "@/components/ui";
import {
  createSupplierSchema,
  updateSupplierSchema,
  type CreateSupplierFormData,
  type UpdateSupplierFormData,
} from "../schemas/supplier.schema";
import { useCreateSupplier } from "../hooks/useCreateSupplier";
import { useUpdateSupplier } from "../hooks/useUpdateSupplier";
import type { SupplierDetail } from "../types/supplier.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

interface SupplierFormProps {
  mode: "create" | "edit";
  supplier?: SupplierDetail;
}

export default function SupplierForm({ mode, supplier }: SupplierFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(supplier?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const schema = isEdit ? updateSupplierSchema : createSupplierSchema;

  const form = useForm<CreateSupplierFormData | UpdateSupplierFormData>({
    resolver: zodResolver(schema) as Resolver<
      CreateSupplierFormData | UpdateSupplierFormData
    >,
    defaultValues: {
      name: supplier?.name ?? "",
      contactPerson: supplier?.contactPerson ?? "",
      email: supplier?.email ?? "",
      phone: supplier?.phone ?? "",
      taxNumber: supplier?.taxNumber ?? "",
      paymentTerms: supplier?.paymentTerms ?? 0,
      rating: supplier?.rating ?? 0,
    },
  });

  useEffect(() => {
    if (isEdit && supplier) {
      form.reset({
        name: supplier.name,
        contactPerson: supplier.contactPerson ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        taxNumber: supplier.taxNumber ?? "",
        paymentTerms: supplier.paymentTerms,
        rating: supplier.rating,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, supplier]);

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const onSubmit = async (data: CreateSupplierFormData | UpdateSupplierFormData) => {
    const payload = {
      name: data.name,
      contactPerson: (data.contactPerson || undefined) as string | undefined,
      email: (data.email || undefined) as string | undefined,
      phone: (data.phone || undefined) as string | undefined,
      taxNumber: (data.taxNumber || undefined) as string | undefined,
      paymentTerms: Number(data.paymentTerms),
      rating: Number(data.rating),
    };

    try {
      if (isEdit && supplier) {
        await updateMutation.mutateAsync(payload);
        router.push(`/purchasing/suppliers/${supplier.id}`);
      } else {
        const created = await createMutation.mutateAsync(payload);
        router.push(`/purchasing/suppliers/${created.id}`);
      }
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? "تعديل المورد" : "مورد جديد"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>{getErrorMessage()}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المورد *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="اسم المورد"
                className="h-10"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">جهة الاتصال</Label>
              <Input
                id="contactPerson"
                {...form.register("contactPerson")}
                placeholder="اسم جهة الاتصال"
                className="h-10"
              />
              {form.formState.errors.contactPerson && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.contactPerson.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="email@example.com"
                className="h-10"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">الهاتف</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="رقم الهاتف"
                className="h-10"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxNumber">الرقم الضريبي</Label>
              <Input
                id="taxNumber"
                {...form.register("taxNumber")}
                placeholder="الرقم الضريبي"
                className="h-10"
              />
              {form.formState.errors.taxNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.taxNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">شروط الدفع (أيام)</Label>
              <Input
                id="paymentTerms"
                type="number"
                min={0}
                step={1}
                {...form.register("paymentTerms", { valueAsNumber: true })}
                className="h-10"
              />
              {form.formState.errors.paymentTerms && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.paymentTerms.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">التقييم (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min={0}
                max={5}
                step="0.5"
                {...form.register("rating", { valueAsNumber: true })}
                className="h-10"
              />
              {form.formState.errors.rating && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.rating.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? "حفظ التغييرات" : "إنشاء المورد"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
