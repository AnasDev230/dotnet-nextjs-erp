using Server.Core.Common;
using Server.Features.Audit.Models;

namespace Server.Features.Audit.Repositories;

public interface IAuditLogRepository
{
    Task<PagedResult<AuditLogListItemResponse>> GetAllAsync(AuditLogQueryParams queryParams);
    Task<AuditLogListItemResponse?> GetByIdAsync(Guid id);
    Task<List<string>> GetDistinctTableNamesAsync();
    Task<List<string>> GetDistinctUserNamesAsync();
}