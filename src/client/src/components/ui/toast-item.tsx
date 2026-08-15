"use client";

import { CheckCircle2, XCircle, AlertTriangle, Info, X, LucideIcon } from "lucide-react";
import { ToastData } from "@/types/toast";
import { useToastStore } from "@/stores/toast-store";

interface VariantConfig {
  icon: LucideIcon;
  iconClass: string;
  iconBg: string;
  border: string;
  progress: string;
}

const variantConfig: Record<ToastData["variant"], VariantConfig> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    progress: "bg-emerald-500/50",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-600",
    iconBg: "bg-red-500/10",
    border: "border-red-500/20",
    progress: "bg-red-500/50",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600",
    iconBg: "bg-amber-500/10",
    border: "border-amber-500/20",
    progress: "bg-amber-500/50",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-600",
    iconBg: "bg-blue-500/10",
    border: "border-blue-500/20",
    progress: "bg-blue-500/50",
  },
};

export function ToastItem({ toast }: { toast: ToastData }) {
  const { removeToast } = useToastStore();
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border ${config.border} bg-card p-4 shadow-lg transition-all duration-300 toast-enter`}
    >
      <div className={`rounded-full ${config.iconBg} p-1.5`}>
        <Icon className={`h-4 w-4 ${config.iconClass}`} />
      </div>

      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground">{toast.description}</p>
        )}
      </div>

      <button
        type="button"
        aria-label="close"
        onClick={() => removeToast(toast.id)}
        className="text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        <X className="h-4 w-4" />
      </button>

      <div
        className={`absolute bottom-0 start-0 h-0.5 ${config.progress} animate-toast-progress`}
        style={{ animationDuration: `${toast.duration ?? 4000}ms` }}
      />
    </div>
  );
}