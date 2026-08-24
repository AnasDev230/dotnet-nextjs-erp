using Server.Features.Notifications.Enums;

namespace Server.Features.Notifications.Entities;
public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>User who should see this notification.</summary>
    public Guid UserId { get; set; }

    /// <summary>Type of notification (determines icon, color, and frontend URL).</summary>
    public NotificationType Type { get; set; }

    /// <summary>Short title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Details/message body.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Related entity ID. Frontend uses this + Type to construct navigation URL.
    /// Backend does NOT know or store frontend routes.
    /// </summary>
    public Guid? EntityId { get; set; }

    /// <summary>Whether user has read it.</summary>
    public bool IsRead { get; set; }

    /// <summary>When it was read.</summary>
    public DateTime? ReadAt { get; set; }

    /// <summary>When it was created.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Auto-expire after 30 days.</summary>
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);
}
