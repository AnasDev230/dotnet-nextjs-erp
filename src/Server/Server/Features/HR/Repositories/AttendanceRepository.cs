using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Repositories;

public class AttendanceRepository : IAttendanceRepository
{
    private readonly AppDbContext _context;

    public AttendanceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AttendanceListItemResponse>> GetAllAsync(
        int page, int pageSize,
        Guid? employeeId, DateTime? date, AttendanceStatus? status,
        DateTime? dateFrom, DateTime? dateTo)
    {
        var query = _context.AttendanceRecords
            .AsNoTracking()
            .Include(a => a.Employee)
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(a => a.EmployeeId == employeeId.Value);

        if (date.HasValue)
        {
            var d = date.Value.Date;
            query = query.Where(a => a.Date.Date == d);
        }

        if (dateFrom.HasValue)
            query = query.Where(a => a.Date.Date >= dateFrom.Value.Date);

        if (dateTo.HasValue)
            query = query.Where(a => a.Date.Date <= dateTo.Value.Date);

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.Date)
            .ThenBy(a => a.Employee.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AttendanceListItemResponse
            {
                Id = a.Id,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee.FirstName + " " + a.Employee.LastName,
                EmployeeNumber = a.Employee.EmployeeNumber,
                Date = a.Date,
                CheckIn = a.CheckIn,
                CheckOut = a.CheckOut,
                WorkHours = a.WorkHours,
                OvertimeHours = a.OvertimeHours,
                BreakMinutes = a.BreakMinutes,
                Status = a.Status,
                Notes = a.Notes,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<AttendanceListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<AttendanceResponse?> GetByIdAsync(Guid id)
    {
        return await _context.AttendanceRecords
            .AsNoTracking()
            .Include(a => a.Employee)
            .Where(a => a.Id == id)
            .Select(a => new AttendanceResponse
            {
                Id = a.Id,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee.FirstName + " " + a.Employee.LastName,
                EmployeeNumber = a.Employee.EmployeeNumber,
                Date = a.Date,
                CheckIn = a.CheckIn,
                CheckOut = a.CheckOut,
                WorkHours = a.WorkHours,
                OvertimeHours = a.OvertimeHours,
                BreakMinutes = a.BreakMinutes,
                Status = a.Status,
                Notes = a.Notes,
                RecordedBy = a.RecordedBy,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<Attendance?> GetEntityByIdAsync(Guid id)
        => await _context.AttendanceRecords.FirstOrDefaultAsync(a => a.Id == id);

    public async Task<bool> ExistsAsync(Guid employeeId, DateTime date)
        => await _context.AttendanceRecords.AnyAsync(a => a.EmployeeId == employeeId && a.Date.Date == date.Date);

    public async Task<bool> ExistsByIdAsync(Guid id)
        => await _context.AttendanceRecords.AnyAsync(a => a.Id == id);

    public async Task AddAsync(Attendance attendance)
        => await _context.AttendanceRecords.AddAsync(attendance);

    public async Task AddRangeAsync(IEnumerable<Attendance> attendances)
        => await _context.AttendanceRecords.AddRangeAsync(attendances);

    public async Task SoftDeleteAsync(Guid id, Guid userId)
    {
        var attendance = await _context.AttendanceRecords.FirstOrDefaultAsync(a => a.Id == id);
        if (attendance is not null)
        {
            attendance.DeletedAt = DateTime.UtcNow;
            attendance.UpdatedBy = userId;
        }
    }

    public async Task<AttendanceSummaryResponse> GetMonthlySummaryAsync(Guid employeeId, int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var query = _context.AttendanceRecords
            .AsNoTracking()
            .Where(a => a.EmployeeId == employeeId
                        && a.Date.Date >= startDate.Date
                        && a.Date.Date <= endDate.Date);

        var totalDays = await query.CountAsync();
        var presentDays = await query.CountAsync(a => a.Status == AttendanceStatus.Present);
        var lateDays = await query.CountAsync(a => a.Status == AttendanceStatus.Late);
        var absentDays = await query.CountAsync(a => a.Status == AttendanceStatus.Absent);
        var leaveDays = await query.CountAsync(a => a.Status == AttendanceStatus.Leave);
        var halfDayCount = await query.CountAsync(a => a.Status == AttendanceStatus.HalfDay);
        var totalWorkHours = await query.Where(a => a.WorkHours.HasValue).SumAsync(a => a.WorkHours!.Value);
        var totalOvertimeHours = await query.SumAsync(a => a.OvertimeHours);

        var employee = await _context.Employees.AsNoTracking()
            .Where(e => e.Id == employeeId)
            .Select(e => e.FirstName + " " + e.LastName)
            .FirstOrDefaultAsync() ?? string.Empty;

        return new AttendanceSummaryResponse
        {
            EmployeeId = employeeId,
            EmployeeName = employee,
            Year = year,
            Month = month,
            TotalDays = totalDays,
            PresentDays = presentDays,
            LateDays = lateDays,
            AbsentDays = absentDays,
            LeaveDays = leaveDays,
            HalfDayCount = halfDayCount,
            TotalWorkHours = totalWorkHours,
            TotalOvertimeHours = totalOvertimeHours
        };
    }

    public async Task<List<Attendance>> GetByEmployeeAndMonthAsync(Guid employeeId, int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        return await _context.AttendanceRecords
            .AsNoTracking()
            .Where(a => a.EmployeeId == employeeId
                        && a.Date.Date >= startDate.Date
                        && a.Date.Date <= endDate.Date)
            .ToListAsync();
    }
}
