import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { NotificationItem } from "@/types/notification";

export async function fetchNotifications(
  take: number = 20
): Promise<NotificationItem[]> {
  const response = await apiClient.get<ApiResponse<NotificationItem[]>>(
    "/notifications",
    { params: { take } }
  );
  return response.data.data;
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await apiClient.get<ApiResponse<number>>(
    "/notifications/unread-count"
  );
  return response.data.data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}
