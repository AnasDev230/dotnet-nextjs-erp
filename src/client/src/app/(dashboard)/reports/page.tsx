"use client";

import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

export default function ReportsHubPage() {
  const { t } = useTranslation();

  const reportCards = [
    {
      title: t("reports.sales"),
      description: t("reports.salesCardDescription"),
      href: "/reports/sales",
      icon: TrendingUp,
      iconClassName: "text-primary",
    },
    {
      title: t("reports.purchases"),
      description: t("reports.purchasesCardDescription"),
      href: "/reports/purchases",
      icon: ShoppingCart,
      iconClassName: "text-blue-600",
    },
    {
      title: t("reports.inventory"),
      description: t("reports.inventoryCardDescription"),
      href: "/reports/inventory",
      icon: Package,
      iconClassName: "text-amber-600",
    },
    {
      title: t("reports.employees"),
      description: t("reports.employeesCardDescription"),
      href: "/reports/employees",
      icon: Users,
      iconClassName: "text-emerald-600",
    },
    {
      title: t("reports.customerStatement"),
      description: t("reports.customerStatementCardDescription"),
      href: "/reports/customer-statement",
      icon: FileText,
      iconClassName: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("reports.title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("reports.hubDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <Card className="transition-colors hover:bg-accent/50 hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${report.iconClassName}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                  <span className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                    {t("reports.viewReport")}
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}