"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Pencil,
  Ban,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Alert,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SupplierStatusBadge } from "./SupplierStatusBadge";
import { useSupplier } from "../hooks/useSupplier";
import { useSuspendSupplier } from "../hooks/useSuspendSupplier";
import { useActivateSupplier } from "../hooks/useActivateSupplier";
import { useProductSuppliersBySupplier } from "../hooks/useProductSuppliersBySupplier";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export default function SupplierDetails({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<"suspend" | "activate" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: supplier, isLoading, error } = useSupplier(supplierId);
  const { data: linkedProducts } = useProductSuppliersBySupplier(supplierId);
  const suspendMutation = useSuspendSupplier();
  const activateMutation = useActivateSupplier();

  const isLoadingAction =
    suspendMutation.isPending || activateMutation.isPending;

  const closeConfirm = () => {
    setConfirmAction(null);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (confirmAction === "suspend") {
      suspendMutation.mutate(supplierId, {
        onSuccess: closeConfirm,
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              t("common.unexpectedError")
          );
        },
      });
    } else if (confirmAction === "activate") {
      activateMutation.mutate(supplierId, {
        onSuccess: closeConfirm,
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              t("common.unexpectedError")
          );
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !supplier) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("purchasing.suppliers.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("purchasing.suppliers.notFoundDescription")}
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
            <h1 className="text-2xl font-semibold">{supplier.name}</h1>
            <p className="text-muted-foreground text-sm">
              <span className="font-mono">{supplier.code}</span> — {t("purchasing.suppliers.details")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/purchasing/suppliers/${supplier.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          </Link>
          {supplier.status === "Active" ? (
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
              {t("purchasing.suppliers.suspend")}
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
              {t("purchasing.suppliers.activate")}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("purchasing.suppliers.supplierInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label={t("purchasing.suppliers.supplierCode")}
              value={<span className="font-mono">{supplier.code}</span>}
            />
            <InfoRow label={t("purchasing.suppliers.contactPerson")} value={supplier.contactPerson ?? "—"} />
            <InfoRow label={t("common.email")} value={supplier.email ?? "—"} />
            <InfoRow label={t("common.phone")} value={supplier.phone ?? "—"} />
            <InfoRow label={t("purchasing.suppliers.taxNumber")} value={supplier.taxNumber ?? "—"} />
            <InfoRow label={t("purchasing.suppliers.paymentTerms")} value={`${supplier.paymentTerms} ${t("common.days")}`} />
            <InfoRow label={t("purchasing.suppliers.rating")} value={supplier.rating} />
            <InfoRow
              label={t("common.status")}
              value={<SupplierStatusBadge status={supplier.status} />}
            />
            <InfoRow label={t("common.createdAt")} value={formatDate(supplier.createdAt, language)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {t("purchasing.suppliers.linkedProducts")} ({linkedProducts?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!linkedProducts || linkedProducts.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              {t("purchasing.suppliers.noLinkedProducts")}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {linkedProducts.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <div className="font-medium">{link.productName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {link.productSku}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-sm font-medium tabular-nums">
                      {formatCurrency(link.unitCost, language)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {link.leadTimeDays} {t("common.days")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && closeConfirm()}
        title={
          confirmAction === "suspend" ? t("purchasing.suppliers.suspendTitle") : t("purchasing.suppliers.activateTitle")
        }
        description={
          confirmAction === "suspend"
            ? t("purchasing.suppliers.suspendDescription")
            : t("purchasing.suppliers.activateDescription")
        }
        confirmLabel={confirmAction === "suspend" ? t("purchasing.suppliers.suspend") : t("purchasing.suppliers.activate")}
        variant={confirmAction === "suspend" ? "danger" : "info"}
        isLoading={isLoadingAction}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
