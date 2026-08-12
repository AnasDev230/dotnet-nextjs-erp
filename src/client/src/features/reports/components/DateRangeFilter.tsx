"use client";

import { CalendarRange } from "lucide-react";
import { Input } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

export default function DateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: DateRangeFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("reports.fromDate")}
          </label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="h-9 w-40"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {t("reports.toDate")}
        </label>
        <Input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className="h-9 w-40"
        />
      </div>
    </div>
  );
}