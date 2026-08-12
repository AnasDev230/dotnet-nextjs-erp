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
import { useTranslation } from "@/hooks/use-translation";
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
  const { t } = useTranslation();
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
              t("common.unexpectedError")
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
              t("common.unexpectedError")
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
              t("common.unexpectedError")
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
              <TableHead>{t("common.code")}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("purchasing.suppliers.contactPerson")}</TableHead>
              <TableHead>{t("common.phone")}</TableHead>
              <TableHead>{t("purchasing.suppliers.rating")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-left">{t("common.actions")}</TableHead>
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
        <h3 className="text-lg font-semibold mb-1">{t("purchasing.suppliers.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("purchasing.suppliers.emptyDescription")}
        </p>
        <Link href="/purchasing/suppliers/new">
          <Button className="gap-2">
            <Truck className="h-4 w-4" />
            {t("purchasing.suppliers.addNew")}
          </Button>
        </Link>
      </div>
    );
  }

  const confirmConfig = {
    delete: {
      open: confirmAction === "delete",
      title: t("purchasing.suppliers.deleteTitle"),
      description: t("purchasing.suppliers.deleteDescription"),
      confirmLabel: t("common.delete"),
      variant: "danger" as const,
    },
    suspend: {
      open: confirmAction === "suspend",
      title: t("purchasing.suppliers.suspendTitle"),
      description: t("purchasing.suppliers.suspendDescription"),
      confirmLabel: t("purchasing.suppliers.suspend"),
      variant: "danger" as const,
    },
    activate: {
      open: confirmAction === "activate",
      title: t("purchasing.suppliers.activateTitle"),
      description: t("purchasing.suppliers.activateDescription"),
      confirmLabel: t("purchasing.suppliers.activate"),
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
              <TableHead>{t("common.code")}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("purchasing.suppliers.contactPerson")}</TableHead>
              <TableHead>{t("common.phone")}</TableHead>
              <TableHead>{t("purchasing.suppliers.rating")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-left">{t("common.actions")}</TableHead>
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
                        title={t("purchasing.suppliers.suspendTitle")}
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
                        title={t("purchasing.suppliers.activateTitle")}
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
            {t("common.showing")} {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} {t("common.of")} {totalCount}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("common.next")}
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
