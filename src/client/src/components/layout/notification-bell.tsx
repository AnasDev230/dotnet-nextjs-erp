"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { getTimeAgo } from "@/lib/formatters";
import { getNotificationUrl } from "@/lib/notification-url";
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks/useNotifications";
import { NotificationIcon } from "@/features/notifications/components/notification-icon";
import type { NotificationItem } from "@/types/notification";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, language } = useTranslation();

  const { data: notifications, isLoading } = useNotifications(20);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: NotificationItem) => {
    const url = getNotificationUrl(notification.type, notification.entityId);
    if (url) {
      router.push(url);
      markAsRead.mutate(notification.id);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("notifications.title")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-9 w-9"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-semibold">
              {t("notifications.title")}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Inbox className="h-8 w-8" />
                <p className="text-sm">{t("notifications.empty")}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/50 px-3 py-2 text-start transition-colors last:border-b-0 hover:bg-muted/50",
                    !notification.isRead && "bg-muted/30"
                  )}
                >
                  <NotificationIcon type={notification.type} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {notification.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="block pt-0.5 text-[11px] text-muted-foreground">
                      {getTimeAgo(notification.createdAt, language)}
                    </span>
                  </span>
                  {!notification.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-3 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-muted/50"
          >
            {t("notifications.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
