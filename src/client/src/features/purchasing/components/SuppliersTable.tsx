"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Ban, CheckCircle, Truck } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SupplierStatusBadge } from "./SupplierStatusBadge";
import { useDeleteSupplier } from "../hooks/useDeleteSupplier";
import { useSuspendSupplier } from "../hooks/useSuspendSupplier";
import { useActivateSupplier } from "../hooks/useActivateSupplier";
import type { SupplierListItem } from "../types/supplier.types";

type ConfirmAction = "delete" | "suspend" | "activate" | null;

interface SuppliersTableProps {
  suppliers: SupplierListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SuppliersTable({
  suppliers,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: SuppliersTableProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteSupplier();
  const suspendMutation = useSuspendSupplier();
  const activateMutation = useActivateSupplier();

  const isLoadingAction =
    deleteMutation.isPending ||
    suspendMutation.isPending ||
    activateMutation.isPending;

  const openConfirm = (action: Exclude<ConfirmAction, null>, id: string) => {
    setErrorMessage(null);
    setSelectedSupplierId(id);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setSelectedSupplierId(null);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (!selectedSupplierId) return;
    if (confirmAction === "delete") {
      deleteMutation.mutate(selectedSupplierId, {
        onSuccess: closeConfirm,
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              "حدث خطأ غير متوقع"
          );
        },
      });
    } else if (confirmAction === "suspend") {
      suspendMutation.mutate(selectedSupplierId, {
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
      activateMutation.mutate(selectedSupplierId, {
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
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الرمز</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>جهة الاتصال</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>التقييم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Truck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">لا يوجد موردون</h3>
        <p className="text-sm text-muted-foreground mb-4">
          لم يتم إضافة أي موردين بعد
        </p>
        <Link href="/purchasing/suppliers/new">
          <Button>
            <Truck className="ml-2 h-4 w-4" />
            إضافة مورد
          </Button>
        </Link>
      </div>
    );
  }

  const confirmConfig = {
    delete: {
      open: confirmAction === "delete",
      title: "حذف المورد",
      description:
        "هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.",
      confirmLabel: "حذف",
      variant: "danger" as const,
    },
    suspend: {
      open: confirmAction === "suspend",
      title: "إيقاف المورد",
      description:
        "هل أنت متأكد من إيقاف هذا المورد؟ لن يتمكن من استلام أوامر شراء جديدة حتى يتم تفعيله.",
      confirmLabel: "إيقاف",
      variant: "danger" as const,
    },
    activate: {
      open: confirmAction === "activate",
      title: "تفعيل المورد",
      description:
        "هل أنت متأكد من تفعيل هذا المورد؟ سيتمكن من استلام أوامر شراء جديدة.",
      confirmLabel: "تفعيل",
      variant: "info" as const,
    },
  };

  const activeConfig =
    confirmAction !== null ? confirmConfig[confirmAction] : null;

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الرمز</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>جهة الاتصال</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>التقييم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {supplier.code}
                </TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {supplier.contactPerson ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {supplier.phone ?? "—"}
                </TableCell>
                <TableCell>{supplier.rating}</TableCell>
                <TableCell>
                  <SupplierStatusBadge status={supplier.status} />
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <Link href={`/purchasing/suppliers/${supplier.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {supplier.status === "Active" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="إيقاف المورد"
                        disabled={isLoadingAction}
                        onClick={() => openConfirm("suspend", supplier.id)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600"
                        title="تفعيل المورد"
                        disabled={isLoadingAction}
                        onClick={() => openConfirm("activate", supplier.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => openConfirm("delete", supplier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            عرض {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} من {totalCount}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {activeConfig && (
        <ConfirmDialog
          open={activeConfig.open}
          onOpenChange={(open) => !open && closeConfirm()}
          title={activeConfig.title}
          description={activeConfig.description}
          confirmLabel={activeConfig.confirmLabel}
          variant={activeConfig.variant}
          isLoading={isLoadingAction}
          errorMessage={errorMessage}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
