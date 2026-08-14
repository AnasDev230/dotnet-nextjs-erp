"use client";

import { Label } from "@/components/ui";

interface DetailFieldProps {
  label: string;
  value: string | number | React.ReactNode;
}

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="text-sm font-medium text-foreground">{value || "—"}</div>
    </div>
  );
}
