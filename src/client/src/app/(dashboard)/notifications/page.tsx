"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCheck, Inbox, Loader2 } from "lucide-react";
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

type NotificationFilter = "all" | "unread";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const router = useRouter();
  const { t, language } = useTranslation();

  const { data: notifications, isLoading } = useNotifications(50);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const filtered = useMemo(
    () =>
      (notifications ?? []).filter(
        (n) => filter === "all" || !n.isRead
      ),
    [notifications, filter]
  );

  const handleNotificationClick = (notification: NotificationItem) => {
    const url = getNotificationUrl(notification.type, notification.entityId);
    if (url) {
      router.push(url);
      markAsRead.mutate(notification.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("notifications.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("notifications.description")}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck />
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          {t("notifications.filter.all")}
        </Button>
        <Button
          size="sm"
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
          className="gap-2"
        >
          {t("notifications.filter.unread")}
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border py-12 text-center">
          <div className="rounded-full bg-muted p-4 text-muted-foreground">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">{t("notifications.empty")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("notifications.emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          {filtered.map((notification) => (
            <div
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(notification)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNotificationClick(notification);
                }
              }}
              className={cn(
                "flex w-full cursor-pointer items-start gap-4 border-b border-border/50 p-4 text-start transition-colors last:border-b-0 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !notification.isRead && "bg-muted/30"
              )}
            >
              <NotificationIcon
                type={notification.type}
                className="h-10 w-10"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {notification.title}
                    {!notification.isRead && (
                      <span className="ms-2 inline-flex h-2 w-2 rounded-full bg-primary align-middle" />
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {getTimeAgo(notification.createdAt, language)}
                  </span>
                </div>
                <p className="truncate pt-0.5 text-sm text-muted-foreground">
                  {notification.message}
                </p>
              </div>
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("notifications.markRead")}
                  className="h-8 w-8 shrink-0"
                  disabled={markAsRead.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead.mutate(notification.id);
                  }}
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              {notification.isRead && (
                <Check className="mt-2 h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
