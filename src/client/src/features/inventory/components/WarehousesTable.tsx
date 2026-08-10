"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Warehouse } from "lucide-react";
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
import { useDeleteWarehouse } from "../hooks/useDeleteWarehouse";
import { useTranslation } from "@/hooks/use-translation";
import type { WarehouseListItem } from "../types/warehouse.types";

interface WarehousesTableProps {
  warehouses: WarehouseListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function WarehousesTable({
  warehouses,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: WarehousesTableProps) {
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteWarehouse();

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
            <TableRow>
              <TableHead>{t("common.code")}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("inventory.warehouses.location")}</TableHead>
              <TableHead>{t("inventory.warehouses.status")}</TableHead>
              <TableHead>{t("common.createdAt")}</TableHead>
              <TableHead className="text-left">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
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

  if (warehouses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Warehouse className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("inventory.warehouses.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("inventory.warehouses.emptyDescription")}</p>
        <Link href="/inventory/warehouses/new">
          <Button>
            <Warehouse className="ml-2 h-4 w-4" />
            {t("inventory.warehouses.addNew")}
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
            <TableRow>
              <TableHead>{t("common.code")}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("inventory.warehouses.location")}</TableHead>
              <TableHead>{t("inventory.warehouses.status")}</TableHead>
              <TableHead>{t("common.createdAt")}</TableHead>
              <TableHead className="text-left">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell className="font-medium font-mono text-xs">{warehouse.code}</TableCell>
                <TableCell>{warehouse.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {warehouse.location ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={warehouse.isActive ? "success" : "secondary"}
                  >
                    {warehouse.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(warehouse.createdAt).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <Link href={`/inventory/warehouses/${warehouse.id}/edit`}>
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
                        setDeleteId(warehouse.id);
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
        title={t("inventory.warehouses.deleteTitle")}
        description={t("inventory.warehouses.deleteDescription")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
