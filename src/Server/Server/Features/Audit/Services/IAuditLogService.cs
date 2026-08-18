using Server.Core.Common;
using Server.Features.Audit.Models;

namespace Server.Features.Audit.Services;

public interface IAuditLogService
{
    Task<PagedResult<AuditLogListItemResponse>> GetAllAsync(AuditLogQueryParams queryParams);
    Task<AuditLogListItemResponse> GetByIdAsync(Guid id);
    Task<List<string>> GetDistinctTableNamesAsync();
    Task<List<string>> GetDistinctUserNamesAsync();
}