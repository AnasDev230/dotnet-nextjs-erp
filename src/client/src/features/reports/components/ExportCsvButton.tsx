"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

interface ExportCsvButtonProps {
  onClick: () => Promise<void> | void;
  label?: string;
  disabled?: boolean;
}

export default function ExportCsvButton({
  onClick,
  label,
  disabled,
}: ExportCsvButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = async () => {
    if (isExporting || disabled) return;
    setIsExporting(true);
    try {
      await onClick();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={disabled || isExporting}
    >
      {isExporting ? (
        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="ml-2 h-4 w-4" />
      )}
      {isExporting ? t("common.exporting") : label ?? t("common.exportCsv")}
    </Button>
  );
}