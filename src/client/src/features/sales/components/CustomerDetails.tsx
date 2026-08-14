"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Pencil, Ban, CheckCircle, Users } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Alert,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DetailField } from "@/components/shared/detail-field";
import { DetailSkeleton } from "@/components/shared/detail-skeleton";
import { useCustomer } from "../hooks/useCustomer";
import { useUpdateCustomer } from "../hooks/useUpdateCustomer";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

const typeBadgeVariant = {
  Company: "default",
  Individual: "secondary",
} as const;

const typeLabelKey = {
  Company: "sales.customers.company",
  Individual: "sales.customers.individual",
} as const;

const statusBadgeVariant = {
  Active: "success",
  Suspended: "destructive",
} as const;

const statusLabelKey = {
  Active: "common.active",
  Suspended: "common.suspended",
} as const;

export default function CustomerDetails({ customerId }: { customerId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<"suspend" | "activate" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: customer, isLoading, error } = useCustomer(customerId);
  const updateMutation = useUpdateCustomer(customerId);

  const isLoadingAction = updateMutation.isPending;

  const closeConfirm = () => {
    setConfirmAction(null);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (!customer) return;

    updateMutation.mutate(
      {
        name: customer.name,
        type: customer.type,
        taxNumber: customer.taxNumber ?? undefined,
        creditLimit: customer.creditLimit,
        paymentTerms: customer.paymentTerms,
        status: confirmAction === "suspend" ? "Suspended" : "Active",
      },
      {
        onSuccess: closeConfirm,
        onError: (err: any) => {
          setErrorMessage(
            err?.response?.data?.message ||
              err?.message ||
              t("common.unexpectedError")
          );
        },
      }
    );
  };

  if (isLoading) return <DetailSkeleton />;

  if (error || !customer) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("sales.customers.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("sales.customers.notFoundDescription")}
            </p>
          </div>
        </div>
        {axiosError?.response?.data?.message && (
          <Alert variant="destructive">
            <p>{axiosError.response.data.message}</p>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{customer.name}</h1>
            <p className="text-muted-foreground text-sm">
              <span className="font-mono">{customer.code}</span> — {t("sales.customers.details")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/sales/customers/${customer.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          </Link>
          {customer.status === "Active" ? (
            <Button
              variant="outline"
              className="gap-2 text-destructive"
              disabled={isLoadingAction}
              onClick={() => {
                setErrorMessage(null);
                setConfirmAction("suspend");
              }}
            >
              <Ban className="h-4 w-4" />
              {t("sales.customers.suspend")}
            </Button>
          ) : (
            <Button
              className="gap-2 text-emerald-600"
              disabled={isLoadingAction}
              onClick={() => {
                setErrorMessage(null);
                setConfirmAction("activate");
              }}
            >
              <CheckCircle className="h-4 w-4" />
              {t("sales.customers.activate")}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {t("sales.customers.info")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t("common.code")} value={<span className="font-mono">{customer.code}</span>} />
            <DetailField label={t("sales.customers.customerName")} value={customer.name} />
            <DetailField
              label={t("sales.customers.customerType")}
              value={<Badge variant={typeBadgeVariant[customer.type]}>{t(typeLabelKey[customer.type])}</Badge>}
            />
            <DetailField label={t("sales.customers.taxNumber")} value={customer.taxNumber ?? "—"} />
            <DetailField
              label={t("sales.customers.creditLimit")}
              value={<span className="tabular-nums">{formatCurrency(customer.creditLimit, language)}</span>}
            />
            <DetailField
              label={t("sales.customers.paymentTerms")}
              value={
                <span className="tabular-nums">
                  {customer.paymentTerms} {t("common.days")}
                </span>
              }
            />
            <DetailField
              label={t("common.status")}
              value={<Badge variant={statusBadgeVariant[customer.status]}>{t(statusLabelKey[customer.status])}</Badge>}
            />
            <DetailField label={t("common.createdAt")} value={formatDate(customer.createdAt, language)} />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && closeConfirm()}
        title={
          confirmAction === "suspend"
            ? t("sales.customers.suspendTitle")
            : t("sales.customers.activateTitle")
        }
        description={
          confirmAction === "suspend"
            ? t("sales.customers.suspendDescription")
            : t("sales.customers.activateDescription")
        }
        confirmLabel={
          confirmAction === "suspend" ? t("sales.customers.suspend") : t("sales.customers.activate")
        }
        variant={confirmAction === "suspend" ? "danger" : "info"}
        isLoading={isLoadingAction}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </div>
  );
}