"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Pencil, Trash2, Package, Boxes } from "lucide-react";
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
import { useProduct } from "../hooks/useProduct";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { useInventoryLevels } from "../hooks/useInventoryLevels";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

export default function ProductDetails({ productId }: { productId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: stock } = useInventoryLevels(
    { productId, pageSize: 50 },
    { enabled: !!productId }
  );
  const deleteMutation = useDeleteProduct();

  const handleDelete = () => {
    deleteMutation.mutate(productId, {
      onSuccess: () => router.push("/inventory/products"),
      onError: (err: any) => {
        setErrorMessage(
          err?.response?.data?.message ||
            err?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  if (isLoading) return <DetailSkeleton />;

  if (error || !product) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("inventory.products.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("inventory.products.notFoundDescription")}
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
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="text-muted-foreground text-sm">
              <span className="font-mono">{product.sku}</span> — {t("inventory.products.details")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/inventory/products/${product.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="gap-2"
            disabled={deleteMutation.isPending}
            onClick={() => {
              setErrorMessage(null);
              setConfirmDelete(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("inventory.products.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t("inventory.products.sku")} value={<span className="font-mono">{product.sku}</span>} />
            <DetailField label={t("inventory.products.name")} value={product.name} />
            <DetailField label={t("inventory.products.category")} value={product.categoryName ?? "—"} />
            <DetailField label={t("inventory.products.unitOfMeasure")} value={product.unitOfMeasure} />
            <DetailField
              label={t("inventory.products.salePrice")}
              value={<span className="tabular-nums">{formatCurrency(product.salePrice, language)}</span>}
            />
            <DetailField label={t("inventory.products.reorderLevel")} value={<span className="tabular-nums">{product.reorderLevel}</span>} />
            <DetailField label={t("inventory.products.reorderQty")} value={<span className="tabular-nums">{product.reorderQty}</span>} />
            <DetailField
              label={t("inventory.products.status")}
              value={
                <Badge variant={product.isActive ? "success" : "neutral"}>
                  {product.isActive ? t("common.active") : t("common.inactive")}
                </Badge>
              }
            />
            <DetailField label={t("common.createdAt")} value={formatDate(product.createdAt, language)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <span className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-muted-foreground" />
              {t("inventory.products.stock")} ({stock?.items?.length ?? 0})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stock || stock.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("inventory.products.noStock")}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {stock.items.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <div className="text-sm font-medium">{level.warehouseName}</div>
                    <div className="text-xs text-muted-foreground">
                      {t("inventory.levels.quantity")}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-sm font-medium tabular-nums">
                      {level.quantityOnHand}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {t("inventory.levels.available")}: {level.quantityAvailable}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {product.description && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t("inventory.products.descriptionLabel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{product.description}</p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDelete(false);
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
    </div>
  );
}
