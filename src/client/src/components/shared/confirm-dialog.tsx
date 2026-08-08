"use client";

import { ReactNode } from "react";
import { AlertTriangle, Info, ShieldAlert, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ═══════════════════════════════════════════
// Types (UNCHANGED — backward compatible)
// ═══════════════════════════════════════════

type ConfirmDialogVariant = "warning" | "danger" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  errorMessage?: string | null;
}

// ═══════════════════════════════════════════
// Variant Configuration — Enterprise Style
// ═══════════════════════════════════════════

const variantConfig: Record<
  ConfirmDialogVariant,
  {
    icon: ReactNode;
    iconBg: string;
    iconColor: string;
    accentBar: string;
    buttonVariant: "default" | "destructive";
  }
> = {
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    accentBar: "bg-amber-500",
    buttonVariant: "default",
  },
  danger: {
    icon: <ShieldAlert className="h-5 w-5" />,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    accentBar: "bg-red-500",
    buttonVariant: "destructive",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    accentBar: "bg-blue-500",
    buttonVariant: "default",
  },
};

// ═══════════════════════════════════════════
// Component — Enterprise Corporate Design
// ═══════════════════════════════════════════

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "تراجع",
  variant = "warning",
  isLoading = false,
  onConfirm,
  errorMessage,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden border-border shadow-lg animate-confirm-enter">
        {/* ─── Accent Bar (top colored line) ─── */}
        <div className={`h-1 w-full ${config.accentBar}`} />

        {/* ─── Content Area ─── */}
        <div className="p-6 space-y-4">
          {/* Header Row: Icon + Title + Description */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                ${config.iconBg} ${config.iconColor}
              `}
            >
              {config.icon}
            </div>

            {/* Text */}
            <div className="flex-1 space-y-1.5 pt-0.5">
              <DialogTitle className="text-base font-semibold text-foreground leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>

          {/* ─── Error Message ─── */}
          {errorMessage && (
            <Alert variant="destructive" className="py-2.5 animate-confirm-fade">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* ─── Footer / Buttons ─── */}
        <div className="border-t border-border bg-muted/30 px-6 py-4">
          <div className="flex gap-3 justify-end">
            {/* Cancel Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="min-w-[80px] h-9 rounded-md font-medium transition-colors duration-150"
            >
              {cancelLabel}
            </Button>

            {/* Confirm Button */}
            <Button
              variant={config.buttonVariant}
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
              className="min-w-[100px] h-9 rounded-md font-medium transition-colors duration-150"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  جاري التنفيذ...
                </span>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}