"use client";

import { TrendingUp, FileText, CreditCard, AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import type { DashboardStats } from "@/types/dashboard";
import { useTranslation } from "@/hooks/use-translation";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: t("dashboard.totalSales"),
      icon: TrendingUp,
      iconClassName: "text-primary",
      value: formatCurrency(stats?.totalSalesAmount ?? 0),
      subtitle: `${stats?.totalSalesCount ?? 0} ${t("dashboard.confirmedSalesOrders")}`,
    },
    {
      title: t("dashboard.totalInvoices"),
      icon: FileText,
      iconClassName: "text-blue-600",
      value: formatCurrency(stats?.totalInvoicesAmount ?? 0),
      subtitle: `${stats?.totalInvoicesCount ?? 0} ${t("dashboard.invoiceCountLabel")}`,
    },
    {
      title: t("dashboard.collectedPayments"),
      icon: CreditCard,
      iconClassName: "text-emerald-600",
      value: formatCurrency(stats?.totalPaidAmount ?? 0),
      subtitle: t("dashboard.totalCollectedPayments"),
    },
    {
      title: t("dashboard.outstandingBalance"),
      icon: AlertCircle,
      iconClassName: "text-amber-600",
      value: formatCurrency(stats?.totalOutstandingAmount ?? 0),
      subtitle: `${stats?.overdueInvoicesCount ?? 0} ${t("dashboard.overdueInvoicesCountLabel")}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.iconClassName}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
