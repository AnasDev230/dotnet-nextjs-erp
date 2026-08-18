using Server.Features.Audit.Enums;

namespace Server.Features.Audit.Models;

public class AuditLogListItemResponse
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public AuditAction Action { get; set; }
    public string ActionName { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public Guid? RecordId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
}