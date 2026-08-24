using Microsoft.EntityFrameworkCore;
using Server.Features.Notifications.Entities;
using Server.Infrastructure.Persistence;

namespace Server.Features.Notifications.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context) => _context = context;

    public async Task<List<Notification>> GetByUserAsync(Guid userId, int take = 20)
        => await _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId && n.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(n => n.CreatedAt)
            .Take(take)
            .ToListAsync();

    public async Task<int> GetUnreadCountAsync(Guid userId)
        => await _context.Notifications
            .AsNoTracking()
            .CountAsync(n => n.UserId == userId && !n.IsRead && n.ExpiresAt > DateTime.UtcNow);

    public async Task AddAsync(Notification notification)
        => await _context.Notifications.AddAsync(notification);

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification is null || notification.IsRead) return;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead && n.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        var now = DateTime.UtcNow;
        foreach (var notification in unread)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }
    }

    public async Task DeleteExpiredAsync()
        => await _context.Notifications
            .Where(n => n.ExpiresAt <= DateTime.UtcNow)
            .ExecuteDeleteAsync();
}
