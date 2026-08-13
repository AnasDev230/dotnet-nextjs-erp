"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Building2, Loader2 } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/features/settings/hooks/useCompanySettings";
import {
  companySettingsFormSchema,
  type CompanySettingsFormData,
} from "@/features/settings/schemas/company-settings.schema";
import type { ApiResponse } from "@/types/auth";

const currencyOptions: { value: string; labelKey: string }[] = [
  { value: "SAR", labelKey: "settings.company.currencySar" },
  { value: "USD", labelKey: "settings.company.currencyUsd" },
  { value: "AED", labelKey: "settings.company.currencyAed" },
  { value: "EGP", labelKey: "settings.company.currencyEgp" },
  { value: "KWD", labelKey: "settings.company.currencyKwd" },
];

export default function SettingsCompanyPage() {
  const { t } = useTranslation();
  const { data: settings, isLoading, isError } = useCompanySettings();
  const updateMutation = useUpdateCompanySettings();

  const zodResolverTyped = zodResolver(
    companySettingsFormSchema
  ) as Resolver<CompanySettingsFormData>;

  const form = useForm<CompanySettingsFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      companyName: "",
      companyNameEn: "",
      taxNumber: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "",
      currency: "SAR",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName ?? "",
        companyNameEn: settings.companyNameEn ?? "",
        taxNumber: settings.taxNumber ?? "",
        phone: settings.phone ?? "",
        email: settings.email ?? "",
        address: settings.address ?? "",
        city: settings.city ?? "",
        country: settings.country ?? "",
        currency: settings.currency ?? "SAR",
      });
    }
  }, [settings, form]);

  const getErrorMessage = (error: unknown): string => {
    if (!error) return "";
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const message = axiosError.response?.data?.message;
    if (message) return message;
    return error instanceof Error ? error.message : "";
  };

  const onSubmit = async (data: CompanySettingsFormData) => {
    try {
      await updateMutation.mutateAsync({
        companyName: data.companyName.trim(),
        companyNameEn: data.companyNameEn?.trim() || undefined,
        taxNumber: data.taxNumber?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        city: data.city?.trim() || undefined,
        country: data.country?.trim() || undefined,
        currency: data.currency,
      });
    } catch {
      // Error handled via mutation state
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("settings.company.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.company.description")}
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <p>{t("common.loadFailed")}</p>
        </Alert>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            {t("settings.company.infoTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {updateMutation.isSuccess && (
            <Alert className="mb-6 border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <p>{t("settings.company.saved")}</p>
            </Alert>
          )}
          {updateMutation.error && (
            <Alert variant="destructive" className="mb-6">
              <p>
                {t("common.error")}: {getErrorMessage(updateMutation.error)}
              </p>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Company Name (Arabic) */}
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {t("settings.company.nameAr")} *
                </Label>
                <Input
                  id="companyName"
                  {...form.register("companyName")}
                  className="h-10"
                />
                {form.formState.errors.companyName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              {/* Company Name (English) */}
              <div className="space-y-2">
                <Label htmlFor="companyNameEn">
                  {t("settings.company.nameEn")}
                </Label>
                <Input
                  id="companyNameEn"
                  dir="ltr"
                  {...form.register("companyNameEn")}
                  className="h-10"
                />
              </div>

              {/* Tax Number */}
              <div className="space-y-2">
                <Label htmlFor="taxNumber">
                  {t("settings.company.taxNumber")}
                </Label>
                <Input
                  id="taxNumber"
                  dir="ltr"
                  {...form.register("taxNumber")}
                  className="h-10"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("settings.company.phone")}</Label>
                <Input
                  id="phone"
                  dir="ltr"
                  {...form.register("phone")}
                  className="h-10"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("settings.company.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  {...form.register("email")}
                  className="h-10"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">
                  {t("settings.company.currency")} *
                </Label>
                <Select
                  id="currency"
                  {...form.register("currency")}
                  options={currencyOptions.map((option) => ({
                    value: option.value,
                    label: t(option.labelKey),
                  }))}
                  className="h-10"
                />
                {form.formState.errors.currency && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.currency.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">{t("settings.company.address")}</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  className="h-10"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">{t("settings.company.city")}</Label>
                <Input id="city" {...form.register("city")} className="h-10" />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">{t("settings.company.country")}</Label>
                <Input
                  id="country"
                  {...form.register("country")}
                  className="h-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gap-2"
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t("settings.company.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}