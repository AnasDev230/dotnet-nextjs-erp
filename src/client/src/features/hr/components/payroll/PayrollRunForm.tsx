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
  Textarea,
  Select,
  Button,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  createPayrollRunSchema,
  type CreatePayrollRunFormData,
} from "../../schemas/payroll.schema";
import { useCreatePayrollRun } from "../../hooks/usePayroll";
import { useTranslation } from "@/hooks/use-translation";

export default function PayrollRunForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const createMutation = useCreatePayrollRun();
  const error = createMutation.error;

  const form = useForm<CreatePayrollRunFormData>({
    resolver: zodResolver(createPayrollRunSchema) as Resolver<CreatePayrollRunFormData>,
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      notes: "",
    },
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: t(`month.${i + 1}`),
  }));

  const onSubmit = async (data: CreatePayrollRunFormData) => {
    try {
      await createMutation.mutateAsync({
        month: Number(data.month),
        year: Number(data.year),
        notes: data.notes || null,
      });
      router.push("/hr/payroll");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("payroll.new")}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>
              {t("common.error")}:{" "}
              {(error as any)?.response?.data?.message || error.message}
            </p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Month */}
            <div className="space-y-2">
              <Label htmlFor="month">{t("payroll.month")} *</Label>
              <Select
                id="month"
                {...form.register("month")}
                className="h-10"
                options={monthOptions}
              />
              {form.formState.errors.month && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.month.message}
                </p>
              )}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">{t("payroll.year")} *</Label>
              <Input
                id="year"
                type="number"
                min={2000}
                max={2100}
                {...form.register("year")}
                className="h-10"
              />
              {form.formState.errors.year && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.year.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("common.notes")}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t("common.notesPlaceholder")}
              rows={3}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {/* Warning */}
          <Alert className="border-amber-500/20 bg-amber-500/10">
            <AlertDescription className="text-sm text-amber-600">
              {t("payroll.confirm.create.description")}
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("payroll.new")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/hr/payroll")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
