"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Pencil, Trash2, FolderTree } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DetailField } from "@/components/shared/detail-field";
import { DetailSkeleton } from "@/components/shared/detail-skeleton";
import { useCategory } from "../hooks/useCategory";
import { useDeleteCategory } from "../hooks/useDeleteCategory";
import { formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

export default function CategoryDetails({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: category, isLoading, error } = useCategory(categoryId);
  const deleteMutation = useDeleteCategory();

  const handleDelete = () => {
    deleteMutation.mutate(categoryId, {
      onSuccess: () => router.push("/inventory/categories"),
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

  if (error || !category) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("inventory.categories.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("inventory.categories.notFoundDescription")}
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
            <h1 className="text-2xl font-semibold">{category.name}</h1>
            <p className="text-muted-foreground text-sm">
              <span className="font-mono">{category.code}</span> — {t("inventory.categories.details")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/inventory/categories/${category.id}/edit`}>
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
          <CardTitle className="text-lg">
            <span className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
              {t("inventory.categories.info")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t("common.code")} value={<span className="font-mono">{category.code}</span>} />
            <DetailField label={t("inventory.categories.name")} value={category.name} />
            <DetailField
              label={t("inventory.categories.parentCategory")}
              value={category.parentName ?? t("inventory.categories.withoutParent")}
            />
            <DetailField label={t("inventory.categories.productsCount")} value={<span className="tabular-nums">{category.productsCount}</span>} />
            <DetailField label={t("common.createdAt")} value={formatDate(category.createdAt, language)} />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDelete(false);
            setErrorMessage(null);
          }
        }}
        title={t("inventory.categories.deleteTitle")}
        description={t("inventory.categories.deleteDescription")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </div>
  );
}
