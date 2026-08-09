"use client";

import { useMemo, type ReactNode } from "react";
import { Inbox } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ReportColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface ReportDataTableProps<T> {
  title: string;
  columns: ReportColumn<T>[];
  data: T[] | undefined;
  isLoading?: boolean;
  emptyMessage?: string;
  keyAccessor: (row: T) => string;
}

export default function ReportDataTable<T>({
  title,
  columns,
  data,
  isLoading,
  emptyMessage = "لا توجد بيانات",
  keyAccessor,
}: ReportDataTableProps<T>) {
  const skeletonColumns = useMemo(
    () => (isLoading ? columns : []),
    [isLoading, columns]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {skeletonColumns.map((column) => (
                    <TableCell key={column.key}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!isLoading && (!data || data.length === 0) ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-40 text-center"
              >
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 rounded-full bg-muted p-3">
                    <Inbox className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading &&
            (data ?? []).map((row) => (
              <TableRow key={keyAccessor(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn("text-xs", column.className)}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}