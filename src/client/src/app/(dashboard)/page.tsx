"use client";

import { RefreshCw, AlertCircle, CheckCircle2, FileWarning } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Alert, AlertTitle, AlertDescription, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import StatsCards from "@/features/dashboard/components/StatsCards";
import RecentOrdersTable from "@/features/dashboard/components/RecentOrdersTable";
import RecentInvoicesTable from "@/features/dashboard/components/RecentInvoicesTable";
import LowStockAlert from "@/features/dashboard/components/LowStockAlert";
import {
  useDashboardStats,
  useRecentOrders,
  useRecentInvoices,
  useLowStockItems,
} from "@/features/dashboard/hooks/useDashboard";
import type { RecentInvoice } from "@/types/dashboard";
import { useTranslation } from "@/hooks/use-translation";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function SectionError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("common.error")}</AlertTitle>
      <AlertDescription>
        {t("common.loadFailed")}
        <Button
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={onRetry}
        >
          {t("common.retry")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function OverdueInvoices({ invoices }: { invoices: RecentInvoice[] }) {
  const overdue = invoices.filter((i) => i.isOverdue);
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileWarning className="h-5 w-5 text-destructive" />
          {t("dashboard.overdueInvoices")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {overdue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 rounded-full bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-600">
              {t("dashboard.noOverdueInvoices")}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {overdue.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium text-destructive">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.customerName}
                  </p>
                </div>
                <span className="text-sm font-semibold text-destructive">
                  {formatCurrency(invoice.netAmount - invoice.paidAmount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const stats = useDashboardStats();
  const recentOrders = useRecentOrders(5);
  const recentInvoices = useRecentInvoices(5);
  const lowStock = useLowStockItems(10);

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-recent-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-recent-invoices"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-low-stock"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("dashboard.description")}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="ml-2 h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </div>

      {stats.isError ? (
        <SectionError onRetry={() => stats.refetch()} />
      ) : (
        <StatsCards stats={stats.data} isLoading={stats.isLoading} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {recentOrders.isError ? (
          <SectionError onRetry={() => recentOrders.refetch()} />
        ) : (
          <RecentOrdersTable
            orders={recentOrders.data}
            isLoading={recentOrders.isLoading}
          />
        )}

        {lowStock.isError ? (
          <SectionError onRetry={() => lowStock.refetch()} />
        ) : (
          <LowStockAlert items={lowStock.data} isLoading={lowStock.isLoading} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {recentInvoices.isError ? (
          <SectionError onRetry={() => recentInvoices.refetch()} />
        ) : (
          <RecentInvoicesTable
            invoices={recentInvoices.data}
            isLoading={recentInvoices.isLoading}
          />
        )}

        {recentInvoices.isError ? (
          <SectionError onRetry={() => recentInvoices.refetch()} />
        ) : recentInvoices.isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileWarning className="h-5 w-5 text-destructive" />
                {t("dashboard.overdueInvoices")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b py-3 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <OverdueInvoices invoices={recentInvoices.data ?? []} />
        )}
      </div>
    </div>
  );
}
