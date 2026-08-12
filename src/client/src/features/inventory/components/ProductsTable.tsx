"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Package } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { useTranslation } from "@/hooks/use-translation";
import type { ProductListItem } from "../types/product.types";

interface ProductsTableProps {
  products: ProductListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductsTable({
  products,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: ProductsTableProps) {
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteProduct();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        setErrorMessage(null);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("inventory.products.sku")}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("inventory.products.category")}</TableHead>
              <TableHead>{t("inventory.products.unitOfMeasure")}</TableHead>
              <TableHead>{t("inventory.products.reorderLevel")}</TableHead>
              <TableHead className="text-end">{t("inventory.products.salePrice")}</TableHead>
              <TableHead>{t("inventory.products.status")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("inventory.products.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("inventory.products.emptyDescription")}</p>
        <Link href="/inventory/products/new">
          <Button className="gap-2">
            <Package className="h-4 w-4" />
            {t("inventory.products.addNew")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("inventory.products.sku")}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("inventory.products.category")}</TableHead>
              <TableHead>{t("inventory.products.unitOfMeasure")}</TableHead>
              <TableHead>{t("inventory.products.reorderLevel")}</TableHead>
              <TableHead className="text-end">{t("inventory.products.salePrice")}</TableHead>
              <TableHead>{t("inventory.products.status")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {product.categoryName ?? "—"}
                </TableCell>
                <TableCell>{product.unitOfMeasure}</TableCell>
                <TableCell className="tabular-nums">{product.reorderLevel}</TableCell>
                <TableCell className="text-end font-mono text-xs tabular-nums">
                  {product.salePrice.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "success" : "neutral"}>
                    {product.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/inventory/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        setErrorMessage(null);
                        setDeleteId(product.id);
                      }}
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
            {t("common.showing")} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} {t("common.of")} {totalCount}
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
        title={t("inventory.products.deleteTitle")}
        description={t("inventory.products.deleteDescription")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
