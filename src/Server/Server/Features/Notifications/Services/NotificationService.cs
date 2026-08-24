using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Server.Features.Notifications.Entities;
using Server.Features.Notifications.Enums;
using Server.Features.Notifications.Models;
using Server.Features.Notifications.Repositories;
using Server.Features.Security;
using Server.Infrastructure.Persistence;

namespace Server.Features.Notifications.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        INotificationRepository repository,
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<NotificationService> logger)
    {
        _repository = repository;
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    // ─── Read Operations ───
    public async Task<List<NotificationResponse>> GetUserNotificationsAsync(Guid userId, int take = 20)
    {
        var notifications = await _repository.GetByUserAsync(userId, take);

        return notifications.Select(n => new NotificationResponse
        {
            Id = n.Id,
            Type = n.Type,
            Title = n.Title,
            Message = n.Message,
            EntityId = n.EntityId,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
        => await _repository.GetUnreadCountAsync(userId);

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        await _repository.MarkAsReadAsync(notificationId, userId);
        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _repository.MarkAllAsReadAsync(userId);
        await _context.SaveChangesAsync();
    }

    // ─── Create Operations ───
    // Notifications are only attached to the change tracker here; the calling
    // Service's SaveChangesAsync persists them atomically with the business event.
    public async Task CreateForUserAsync(Guid userId, NotificationType type, string title, string message, Guid? entityId = null)
    {
        try
        {
            var notification = new Notification
            {
                UserId = userId,
                Type = type,
                Title = title.Length > 200 ? title[..200] : title,
                Message = message.Length > 500 ? message[..500] : message,
                EntityId = entityId
            };

            await _repository.AddAsync(notification);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create notification for user {UserId}", userId);
        }
    }

    public async Task CreateForRoleAsync(string role, NotificationType type, string title, string message, Guid? entityId = null)
    {
        try
        {
            var users = await _userManager.GetUsersInRoleAsync(role);

            foreach (var user in users.DistinctBy(u => u.Id))
            {
                await CreateForUserAsync(user.Id, type, title, message, entityId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create notifications for role {Role}", role);
        }
    }

    public async Task CreateForAllAsync(NotificationType type, string title, string message, Guid? entityId = null)
    {
        try
        {
            var userIds = await _userManager.Users
                .Where(u => u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var userId in userIds)
            {
                await CreateForUserAsync(userId, type, title, message, entityId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create notifications for all users");
        }
    }
}
