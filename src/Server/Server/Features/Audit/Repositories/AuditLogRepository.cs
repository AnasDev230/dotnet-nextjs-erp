using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.Audit.Entities;
using Server.Features.Audit.Enums;
using Server.Features.Audit.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.Audit.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly AppDbContext _context;

    private static readonly Expression<Func<AuditLog, AuditLogListItemResponse>> Projection = l =>
        new AuditLogListItemResponse
        {
            Id = l.Id,
            UserId = l.UserId,
            UserName = l.UserName,
            Action = l.Action,
            ActionName = l.Action == AuditAction.Create ? "Create"
                      : l.Action == AuditAction.Update ? "Update"
                      : "Delete",
            TableName = l.TableName,
            RecordId = l.RecordId,
            OldValues = l.OldValues,
            NewValues = l.NewValues,
            IpAddress = l.IpAddress,
            Timestamp = l.Timestamp
        };

    public AuditLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AuditLogListItemResponse>> GetAllAsync(AuditLogQueryParams queryParams)
    {
        var query = _context.AuditLogs.AsNoTracking().AsQueryable();

        if (queryParams.Action.HasValue)
            query = query.Where(l => l.Action == queryParams.Action.Value);

        if (!string.IsNullOrWhiteSpace(queryParams.TableName))
            query = query.Where(l => l.TableName == queryParams.TableName);

        if (!string.IsNullOrWhiteSpace(queryParams.UserName))
            query = query.Where(l => l.UserName == queryParams.UserName);

        if (queryParams.FromDate.HasValue)
            query = query.Where(l => l.Timestamp >= queryParams.FromDate.Value);

        if (queryParams.ToDate.HasValue)
            query = query.Where(l => l.Timestamp <= queryParams.ToDate.Value.AddDays(1));

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .Select(Projection)
            .ToListAsync();

        return new PagedResult<AuditLogListItemResponse>
        {
            Items = items,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<AuditLogListItemResponse?> GetByIdAsync(Guid id)
        => await _context.AuditLogs
            .AsNoTracking()
            .Where(l => l.Id == id)
            .Select(Projection)
            .FirstOrDefaultAsync();

    public async Task<List<string>> GetDistinctTableNamesAsync()
        => await _context.AuditLogs
            .AsNoTracking()
            .Select(l => l.TableName)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync();

    public async Task<List<string>> GetDistinctUserNamesAsync()
        => await _context.AuditLogs
            .AsNoTracking()
            .Where(l => l.UserName != null)
            .Select(l => l.UserName!)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync();
}