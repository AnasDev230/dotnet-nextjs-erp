using Server.Features.Notifications.Enums;
using Server.Features.Notifications.Models;

namespace Server.Features.Notifications.Services;

public interface INotificationService
{
    // ─── Read Operations (used by Controller) ───
    Task<List<NotificationResponse>> GetUserNotificationsAsync(Guid userId, int take = 20);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);

    // ─── Create Operations (used by other Services; non-blocking, no SaveChanges) ───
    Task CreateForUserAsync(Guid userId, NotificationType type, string title, string message, Guid? entityId = null);
    Task CreateForRoleAsync(string role, NotificationType type, string title, string message, Guid? entityId = null);
    Task CreateForAllAsync(NotificationType type, string title, string message, Guid? entityId = null);
}
