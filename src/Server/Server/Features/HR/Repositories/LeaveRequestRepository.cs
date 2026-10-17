using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Repositories;

public class LeaveRequestRepository : ILeaveRequestRepository
{
    private readonly AppDbContext _context;

    public LeaveRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<LeaveRequestListItemResponse>> GetAllAsync(
        int page, int pageSize,
        Guid? employeeId, LeaveStatus? status, LeaveType? leaveType,
        DateTime? dateFrom, DateTime? dateTo)
    {
        var query = _context.LeaveRequests
            .AsNoTracking()
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(l => l.EmployeeId == employeeId.Value);

        if (status.HasValue)
            query = query.Where(l => l.Status == status.Value);

        if (leaveType.HasValue)
            query = query.Where(l => l.LeaveType == leaveType.Value);

        if (dateFrom.HasValue)
            query = query.Where(l => l.EndDate.Date >= dateFrom.Value.Date);

        if (dateTo.HasValue)
            query = query.Where(l => l.StartDate.Date <= dateTo.Value.Date);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(l => l.StartDate)
            .ThenByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new LeaveRequestListItemResponse
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee.FirstName + " " + l.Employee.LastName,
                EmployeeNumber = l.Employee.EmployeeNumber,
                LeaveType = l.LeaveType,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                DaysRequested = l.DaysRequested,
                Status = l.Status,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<LeaveRequestListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<LeaveRequestResponse?> GetByIdAsync(Guid id)
    {
        return await _context.LeaveRequests
            .AsNoTracking()
            .Where(l => l.Id == id)
            .Select(l => new LeaveRequestResponse
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee.FirstName + " " + l.Employee.LastName,
                EmployeeNumber = l.Employee.EmployeeNumber,
                LeaveType = l.LeaveType,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                DaysRequested = l.DaysRequested,
                Status = l.Status,
                Reason = l.Reason,
                DecisionNote = l.DecisionNote,
                ApprovedBy = l.ApprovedBy,
                ApprovedByName = l.ApprovedBy == null
                    ? null
                    : _context.Users
                        .Where(u => u.Id == l.ApprovedBy.Value)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                ApprovedAt = l.ApprovedAt,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<LeaveRequest?> GetEntityByIdAsync(Guid id)
        => await _context.LeaveRequests.FirstOrDefaultAsync(l => l.Id == id);

    public async Task<bool> ExistsByIdAsync(Guid id)
        => await _context.LeaveRequests.AnyAsync(l => l.Id == id);

    public async Task<bool> HasOverlappingAsync(
        Guid employeeId, DateTime startDate, DateTime endDate, Guid? excludeId)
        => await _context.LeaveRequests.AnyAsync(l =>
            l.EmployeeId == employeeId
            && l.Status != LeaveStatus.Rejected
            && l.Status != LeaveStatus.Cancelled
            && l.StartDate.Date <= endDate.Date
            && l.EndDate.Date >= startDate.Date
            && (!excludeId.HasValue || l.Id != excludeId.Value));

    public async Task<LeaveSummaryResponse> GetYearSummaryAsync(Guid employeeId, int year)
    {
        var yearStart = new DateTime(year, 1, 1);
        var yearEnd = yearStart.AddYears(1).AddDays(-1);

        var leaves = await _context.LeaveRequests
            .AsNoTracking()
            .Where(l => l.EmployeeId == employeeId
                        && l.Status == LeaveStatus.Approved
                        && l.StartDate.Date <= yearEnd
                        && l.EndDate.Date >= yearStart)
            .Select(l => new { l.LeaveType, l.DaysRequested })
            .ToListAsync();

        var employeeName = await _context.Employees
            .AsNoTracking()
            .Where(e => e.Id == employeeId)
            .Select(e => e.FirstName + " " + e.LastName)
            .FirstOrDefaultAsync() ?? string.Empty;

        var byType = leaves
            .GroupBy(l => l.LeaveType)
            .Select(g => new LeaveTypeSummaryItemResponse
            {
                LeaveType = g.Key,
                DaysUsed = g.Sum(l => l.DaysRequested),
                RequestCount = g.Count()
            })
            .OrderBy(g => g.LeaveType)
            .ToList();

        return new LeaveSummaryResponse
        {
            EmployeeId = employeeId,
            EmployeeName = employeeName,
            Year = year,
            TotalApprovedDays = byType.Sum(t => t.DaysUsed),
            ByType = byType
        };
    }

    public async Task AddAsync(LeaveRequest leaveRequest)
        => await _context.LeaveRequests.AddAsync(leaveRequest);

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var leaveRequest = await _context.LeaveRequests.FirstOrDefaultAsync(l => l.Id == id);
        if (leaveRequest is not null)
        {
            leaveRequest.DeletedAt = DateTime.UtcNow;
            leaveRequest.UpdatedBy = userId;
        }
    }
}
