using Server.Features.Audit.Enums;

namespace Server.Features.Audit.Models;

public class AuditLogQueryParams
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public AuditAction? Action { get; set; }
    public string? TableName { get; set; }
    public string? UserName { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}