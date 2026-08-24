import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  Info,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_TYPE_CONFIG,
  type NotificationType,
} from "@/types/notification";

const TYPE_ICONS: Record<string, typeof Bell> = {
  AlertTriangle: AlertTriangle,
  Clock: Clock,
  AlertCircle: AlertCircle,
  FileText: FileText,
  CheckCircle: CheckCircle,
  ShoppingCart: ShoppingCart,
  Package: Package,
  ArrowLeftRight: ArrowLeftRight,
  Receipt: Receipt,
  Info: Info,
};

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

export function NotificationIcon({ type, className }: NotificationIconProps) {
  const config = NOTIFICATION_TYPE_CONFIG[type];
  const Icon = TYPE_ICONS[config?.icon ?? ""] ?? Bell;

  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        config.colorClass,
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
