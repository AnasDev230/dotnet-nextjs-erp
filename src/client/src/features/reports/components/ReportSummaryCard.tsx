"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ReportSummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  subtitle?: string;
  isLoading?: boolean;
}

export default function ReportSummaryCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  subtitle,
  isLoading,
}: ReportSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}