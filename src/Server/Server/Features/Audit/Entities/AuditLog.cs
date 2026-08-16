using Server.Features.Audit.Enums;

namespace Server.Features.Audit.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? UserId { get; set; }

    public string? UserName { get; set; }

    public AuditAction Action { get; set; }

    public string TableName { get; set; } = string.Empty;

    public Guid? RecordId { get; set; }

    public string? OldValues { get; set; }

    public string? NewValues { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}