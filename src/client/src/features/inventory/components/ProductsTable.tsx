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
            "حدث خطأ غير متوقع"
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
              <TableHead>رمز المنتج</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>الوحدة</TableHead>
              <TableHead>مستوى الطلب</TableHead>
              <TableHead className="text-left">السعر</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
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
        <h3 className="text-lg font-semibold mb-1">لا توجد منتجات</h3>
        <p className="text-sm text-muted-foreground mb-4">لم يتم إضافة أي منتجات بعد</p>
        <Link href="/inventory/products/new">
          <Button>
            <Package className="ml-2 h-4 w-4" />
            إضافة منتج
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
              <TableHead>رمز المنتج</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>الوحدة</TableHead>
              <TableHead>مستوى الطلب</TableHead>
              <TableHead className="text-left">السعر</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
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
                <TableCell>{product.reorderLevel}</TableCell>
                <TableCell className="text-left font-mono text-xs">
                  {product.salePrice.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "success" : "neutral"}>
                    {product.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
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
            عرض {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} من {totalCount}
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

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
            setErrorMessage(null);
          }
        }}
        title="حذف المنتج"
        description="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
