using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Features.HR.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Services;

public class AttendanceService : IAttendanceService
{
    private static readonly TimeSpan LateThreshold = new(9, 0, 0);

    private readonly IAttendanceRepository _repository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AttendanceService(
        IAttendanceRepository repository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<AttendanceListItemResponse>> GetAllAsync(
        int page, int pageSize,
        Guid? employeeId, DateTime? date, AttendanceStatus? status,
        DateTime? dateFrom, DateTime? dateTo)
        => await _repository.GetAllAsync(page, pageSize, employeeId, date, status, dateFrom, dateTo);

    public async Task<AttendanceResponse> GetByIdAsync(Guid id)
    {
        var attendance = await _repository.GetByIdAsync(id);
        if (attendance is null) throw new NotFoundException(nameof(Attendance), id);
        return attendance;
    }

    public async Task<AttendanceResponse> CreateAsync(CreateAttendanceRequest request)
    {
        // 1. Validate Employee exists and is Active
        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId)
            ?? throw new NotFoundException(nameof(Employee), request.EmployeeId);

        if (employee.Status != EmployeeStatus.Active)
            throw new BusinessException("لا يمكن تسجيل حضور لموظف غير نشط.");

        // 2. Validate no existing attendance for same employee + date
        var dateOnly = request.Date.Date;
        if (await _repository.ExistsAsync(request.EmployeeId, dateOnly))
            throw new BusinessException("يوجد سجل حضور مسبق لهذا الموظف في نفس التاريخ.");

        // 3. Calculate WorkHours if CheckIn + CheckOut provided
        decimal? workHours = null;
        if (request.CheckIn.HasValue && request.CheckOut.HasValue)
        {
            workHours = CalculateWorkHours(request.CheckIn.Value, request.CheckOut.Value, request.BreakMinutes);
        }

        // 4. Auto-detect Late if CheckIn > 09:00
        var status = request.Status;
        if (request.CheckIn.HasValue && request.CheckIn.Value > LateThreshold && status == AttendanceStatus.Present)
        {
            status = AttendanceStatus.Late;
        }

        var attendance = new Attendance
        {
            EmployeeId = request.EmployeeId,
            Date = dateOnly,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            WorkHours = workHours,
            OvertimeHours = 0,
            BreakMinutes = request.BreakMinutes,
            Status = status,
            Notes = request.Notes,
            RecordedBy = _currentUserService.UserId,
            CreatedBy = _currentUserService.UserId
        };

        // Overtime: if workHours > 8, overtime = workHours - 8
        if (workHours.HasValue && workHours.Value > 8)
        {
            attendance.OvertimeHours = workHours.Value - 8;
        }

        await _repository.AddAsync(attendance);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(attendance.Id);
    }

    public async Task<List<AttendanceResponse>> BulkCreateAsync(BulkAttendanceRequest request)
    {
        var dateOnly = request.Date.Date;
        var results = new List<Attendance>();

        // Get all employeeIds from request
        var employeeIds = request.Items.Select(i => i.EmployeeId).Distinct().ToList();

        // Fetch existing attendances for this date to skip duplicates
        var existingEmployeeIds = await _context.AttendanceRecords
            .AsNoTracking()
            .Where(a => a.Date.Date == dateOnly && employeeIds.Contains(a.EmployeeId))
            .Select(a => a.EmployeeId)
            .ToListAsync();

        // Fetch employees to validate Active status
        var employees = await _context.Employees
            .AsNoTracking()
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id);

        foreach (var item in request.Items)
        {
            // Skip if already has record for that date
            if (existingEmployeeIds.Contains(item.EmployeeId))
                continue;

            if (!employees.TryGetValue(item.EmployeeId, out var employee))
                throw new NotFoundException(nameof(Employee), item.EmployeeId);

            if (employee.Status != EmployeeStatus.Active)
                continue; // skip inactive employees

            decimal? workHours = null;
            if (item.CheckIn.HasValue && item.CheckOut.HasValue)
            {
                // Bulk items use default BreakMinutes = 60 unless status is Absent/Leave where no hours
                workHours = CalculateWorkHours(item.CheckIn.Value, item.CheckOut.Value, 60);
            }

            var status = item.Status;
            if (item.CheckIn.HasValue && item.CheckIn.Value > LateThreshold && status == AttendanceStatus.Present)
            {
                status = AttendanceStatus.Late;
            }

            var attendance = new Attendance
            {
                EmployeeId = item.EmployeeId,
                Date = dateOnly,
                CheckIn = item.CheckIn,
                CheckOut = item.CheckOut,
                WorkHours = workHours,
                OvertimeHours = workHours.HasValue && workHours.Value > 8 ? workHours.Value - 8 : 0,
                BreakMinutes = 60,
                Status = status,
                Notes = item.Notes,
                RecordedBy = _currentUserService.UserId,
                CreatedBy = _currentUserService.UserId
            };

            results.Add(attendance);
        }

        if (results.Count > 0)
        {
            await _repository.AddRangeAsync(results);
            await _context.SaveChangesAsync();
        }

        // Return created records
        var created = new List<AttendanceResponse>();
        foreach (var att in results)
        {
            var resp = await _repository.GetByIdAsync(att.Id);
            if (resp is not null) created.Add(resp);
        }

        return created;
    }

    public async Task<AttendanceResponse> UpdateAsync(Guid id, UpdateAttendanceRequest request)
    {
        var attendance = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(Attendance), id);

        // Recalculate WorkHours if times change
        decimal? workHours = null;
        if (request.CheckIn.HasValue && request.CheckOut.HasValue)
        {
            workHours = CalculateWorkHours(request.CheckIn.Value, request.CheckOut.Value, request.BreakMinutes);
        }
        else if (request.CheckIn.HasValue || request.CheckOut.HasValue)
        {
            // If only one of them is provided, use existing other value if available
            var checkIn = request.CheckIn ?? attendance.CheckIn;
            var checkOut = request.CheckOut ?? attendance.CheckOut;
            if (checkIn.HasValue && checkOut.HasValue)
            {
                workHours = CalculateWorkHours(checkIn.Value, checkOut.Value, request.BreakMinutes);
            }
        }

        var status = request.Status;
        var effectiveCheckIn = request.CheckIn ?? attendance.CheckIn;
        if (effectiveCheckIn.HasValue && effectiveCheckIn.Value > LateThreshold && status == AttendanceStatus.Present)
        {
            status = AttendanceStatus.Late;
        }

        attendance.CheckIn = request.CheckIn;
        attendance.CheckOut = request.CheckOut;
        attendance.BreakMinutes = request.BreakMinutes;
        attendance.Status = status;
        attendance.Notes = request.Notes;
        attendance.WorkHours = workHours;

        if (workHours.HasValue && workHours.Value > 8)
            attendance.OvertimeHours = workHours.Value - 8;
        else if (workHours.HasValue)
            attendance.OvertimeHours = 0;

        attendance.UpdatedBy = _currentUserService.UserId;
        attendance.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await _repository.ExistsByIdAsync(id))
            throw new NotFoundException(nameof(Attendance), id);

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    public async Task<AttendanceSummaryResponse> GetMonthlySummaryAsync(Guid employeeId, int year, int month)
    {
        // Validate employee exists
        var exists = await _context.Employees.AnyAsync(e => e.Id == employeeId);
        if (!exists) throw new NotFoundException(nameof(Employee), employeeId);

        if (month < 1 || month > 12)
            throw new BusinessException("الشهر يجب أن يكون بين 1 و 12.");

        if (year < 2000 || year > 2100)
            throw new BusinessException("السنة غير صحيحة.");

        return await _repository.GetMonthlySummaryAsync(employeeId, year, month);
    }

    private static decimal CalculateWorkHours(TimeSpan checkIn, TimeSpan checkOut, int breakMinutes)
    {
        var totalMinutes = (checkOut - checkIn).TotalMinutes - breakMinutes;
        if (totalMinutes < 0) totalMinutes = 0;
        var hours = (decimal)(totalMinutes / 60.0);
        return Math.Round(hours, 2);
    }
}
