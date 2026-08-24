using Server.Features.Notifications.Entities;

namespace Server.Features.Notifications.Repositories;

public interface INotificationRepository
{
    // Read
    Task<List<Notification>> GetByUserAsync(Guid userId, int take = 20);
    Task<int> GetUnreadCountAsync(Guid userId);

    // Write (change-tracking only — Service owns SaveChangesAsync)
    Task AddAsync(Notification notification);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);

    // Cleanup
    Task DeleteExpiredAsync();
}
