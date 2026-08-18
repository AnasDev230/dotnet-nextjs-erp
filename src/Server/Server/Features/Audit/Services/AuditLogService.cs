using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Audit.Entities;
using Server.Features.Audit.Models;
using Server.Features.Audit.Repositories;

namespace Server.Features.Audit.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _repository;

    public AuditLogService(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResult<AuditLogListItemResponse>> GetAllAsync(AuditLogQueryParams queryParams)
        => _repository.GetAllAsync(queryParams);

    public async Task<AuditLogListItemResponse> GetByIdAsync(Guid id)
    {
        var log = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(AuditLog), id);
        return log;
    }

    public Task<List<string>> GetDistinctTableNamesAsync()
        => _repository.GetDistinctTableNamesAsync();

    public Task<List<string>> GetDistinctUserNamesAsync()
        => _repository.GetDistinctUserNamesAsync();
}