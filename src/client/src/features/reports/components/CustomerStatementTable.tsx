"use client";

import { FileText } from "lucide-react";
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
import type { StatementLineItem } from "@/types/reports";
import { useTranslation } from "@/hooks/use-translation";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

interface CustomerStatementTableProps {
  transactions: StatementLineItem[] | undefined;
  isLoading?: boolean;
}

export default function CustomerStatementTable({
  transactions,
  isLoading,
}: CustomerStatementTableProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          {t("reports.transactions")}
        </CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t("common.date")}</TableHead>
            <TableHead>{t("common.type")}</TableHead>
            <TableHead>{t("finance.payments.reference")}</TableHead>
            <TableHead>{t("reports.debit")}</TableHead>
            <TableHead>{t("reports.credit")}</TableHead>
            <TableHead>{t("reports.runningBalance")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !transactions || transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("reports.noTransactions")}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction, index) => (
              <TableRow key={`${transaction.date}-${transaction.reference}-${index}`}>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      transaction.type === "Invoice"
                        ? "text-xs font-medium text-blue-600"
                        : "text-xs font-medium text-emerald-600"
                    }
                  >
                    {transaction.type === "Invoice" ? t("reports.typeInvoice") : t("reports.typePayment")}
                  </span>
                </TableCell>
                <TableCell className="text-xs">{transaction.reference}</TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums">
                  {transaction.debit > 0 ? formatCurrency(transaction.debit) : "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums">
                  {transaction.credit > 0 ? formatCurrency(transaction.credit) : "—"}
                </TableCell>
                <TableCell className="text-xs font-semibold tabular-nums">
                  {formatCurrency(transaction.runningBalance)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}