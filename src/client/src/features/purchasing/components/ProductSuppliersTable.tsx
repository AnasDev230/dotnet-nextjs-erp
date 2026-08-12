"use client";

import { useState } from "react";
import { Trash2, Package, Star } from "lucide-react";
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
import { useDeleteProductSupplier } from "../hooks/useDeleteProductSupplier";
import type { ProductSupplierListItem } from "../types/product-supplier.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface ProductSuppliersTableProps {
  links: ProductSupplierListItem[];
  isLoading: boolean;
  title: string;
  emptyMessage: string;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductSuppliersTable({
  links,
  isLoading,
  title,
  emptyMessage,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: ProductSuppliersTableProps) {
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteProductSupplier();

  const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      axiosError.response?.data?.message ||
      (error instanceof Error ? error.message : "") ||
      t("common.unexpectedError")
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        setErrorMessage(null);
      },
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("purchasing.productSuppliers.product")}</TableHead>
              <TableHead>{t("purchasing.productSuppliers.supplierSku")}</TableHead>
              <TableHead>{t("purchasing.productSuppliers.leadTimeDays")}</TableHead>
              <TableHead className="text-end">{t("purchasing.productSuppliers.unitCost")}</TableHead>
              <TableHead>{t("purchasing.productSuppliers.primary")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
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

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("purchasing.productSuppliers.product")}</TableHead>
              <TableHead>{t("purchasing.productSuppliers.supplierSku")}</TableHead>
              <TableHead>{t("purchasing.productSuppliers.leadTimeDays")}</TableHead>
              <TableHead className="text-end">{t("purchasing.productSuppliers.unitCost")}</TableHead>
              <TableHead>{t("purchasing.productSuppliers.primary")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell>
                  <div className="font-medium">{link.productName}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {link.productSku}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {link.supplierSku ?? "—"}
                </TableCell>
                <TableCell className="tabular-nums">{link.leadTimeDays} {t("common.days")}</TableCell>
                <TableCell className="text-end font-mono text-xs tabular-nums">
                  {formatCurrency(link.unitCost)}
                </TableCell>
                <TableCell>
                  {link.isPrimary ? (
                    <Badge variant="success" className="gap-1">
                      <Star className="h-3 w-3" />
                      {t("purchasing.productSuppliers.primary")}
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      {t("purchasing.productSuppliers.notPrimary")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      setErrorMessage(null);
                      setDeleteId(link.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
            setErrorMessage(null);
          }
        }}
        title={t("purchasing.productSuppliers.unlinkTitle")}
        description={t("purchasing.productSuppliers.unlinkDescription")}
        confirmLabel={t("common.confirm")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
