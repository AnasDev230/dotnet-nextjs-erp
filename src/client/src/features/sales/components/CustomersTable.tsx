"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Users, Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
} from "@/components/ui";
import { useDeleteCustomer } from "../hooks/useDeleteCustomer";
import type { CustomerListItem } from "../types/customer.types";

const typeBadgeVariant = {
  Company: "default",
  Individual: "secondary",
} as const;

const typeLabel = {
  Company: "شركة",
  Individual: "فرد",
} as const;

const statusBadgeVariant = {
  Active: "success",
  Suspended: "destructive",
} as const;

const statusLabel = {
  Active: "نشط",
  Suspended: "موقوف",
} as const;

interface CustomersTableProps {
  customers: CustomerListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CustomersTable({
  customers,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: CustomersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteCustomer();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الرمز</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>حد الائتمان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
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

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">لا يوجد عملاء</h3>
        <p className="text-sm text-muted-foreground mb-4">لم يتم إضافة أي عملاء بعد</p>
        <Link href="/sales/customers/new">
          <Button>
            <Users className="ml-2 h-4 w-4" />
            إضافة عميل
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
              <TableHead>الرمز</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>حد الائتمان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium font-mono text-xs">{customer.code}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>
                  <Badge variant={typeBadgeVariant[customer.type]}>
                    {typeLabel[customer.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.creditLimit.toLocaleString("ar-SA")} ر.س
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[customer.status]}>
                    {statusLabel[customer.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(customer.createdAt).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <Link href={`/sales/customers/${customer.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(customer.id)}
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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا العميل؟
              <br />
              <span className="text-amber-600 font-medium">
                سيتم تعطيل العميل ولن يمكن استخدامه في الطلبات المستقبلية.
              </span>
              {" "}لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId, {
                    onSuccess: () => setDeleteId(null),
                  });
                }
              }}
            >
              {deleteMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
