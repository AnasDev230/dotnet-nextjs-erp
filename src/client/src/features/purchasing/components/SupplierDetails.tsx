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
              "حدث خطأ غير متوقع"
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
              "حدث خطأ غير متوقع"
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
            <h1 className="text-2xl font-semibold">المورد غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على المورد المطلوب
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
              <span className="font-mono">{supplier.code}</span> — تفاصيل المورد
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/purchasing/suppliers/${supplier.id}/edit`}>
            <Button variant="outline">
              <Pencil className="ml-2 h-4 w-4" />
              تعديل
            </Button>
          </Link>
          {supplier.status === "Active" ? (
            <Button
              variant="outline"
              className="text-destructive"
              disabled={isLoadingAction}
              onClick={() => {
                setErrorMessage(null);
                setConfirmAction("suspend");
              }}
            >
              <Ban className="ml-2 h-4 w-4" />
              إيقاف
            </Button>
          ) : (
            <Button
              className="text-emerald-600"
              disabled={isLoadingAction}
              onClick={() => {
                setErrorMessage(null);
                setConfirmAction("activate");
              }}
            >
              <CheckCircle className="ml-2 h-4 w-4" />
              تفعيل
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">بيانات المورد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label="رمز المورد"
              value={<span className="font-mono">{supplier.code}</span>}
            />
            <InfoRow label="جهة الاتصال" value={supplier.contactPerson ?? "—"} />
            <InfoRow label="البريد الإلكتروني" value={supplier.email ?? "—"} />
            <InfoRow label="الهاتف" value={supplier.phone ?? "—"} />
            <InfoRow label="الرقم الضريبي" value={supplier.taxNumber ?? "—"} />
            <InfoRow label="شروط الدفع" value={`${supplier.paymentTerms} يوم`} />
            <InfoRow label="التقييم" value={supplier.rating} />
            <InfoRow
              label="الحالة"
              value={<SupplierStatusBadge status={supplier.status} />}
            />
            <InfoRow label="تاريخ الإنشاء" value={new Date(supplier.createdAt).toLocaleDateString("ar-SA")} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            المنتجات المرتبطة ({linkedProducts?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!linkedProducts || linkedProducts.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 ml-2" />
              لا توجد منتجات مرتبطة بهذا المورد
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
                  <div className="text-left">
                    <div className="text-sm font-medium">
                      {link.unitCost.toLocaleString("ar-SA", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {link.leadTimeDays} يوم
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
          confirmAction === "suspend" ? "إيقاف المورد" : "تفعيل المورد"
        }
        description={
          confirmAction === "suspend"
            ? "هل أنت متأكد من إيقاف هذا المورد؟ لن يتمكن من استلام أوامر شراء جديدة حتى يتم تفعيله."
            : "هل أنت متأكد من تفعيل هذا المورد؟ سيتمكن من استلام أوامر شراء جديدة."
        }
        confirmLabel={confirmAction === "suspend" ? "إيقاف" : "تفعيل"}
        variant={confirmAction === "suspend" ? "danger" : "info"}
        isLoading={isLoadingAction}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
