using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Core.Exceptions;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Features.HR.Repositories;
using Server.Features.Notifications.Enums;
using Server.Features.Notifications.Services;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Services;

public class LeaveRequestService : ILeaveRequestService
{
    private const int MaxLeaveDays = 365;

    private static readonly Dictionary<LeaveType, string> LeaveTypeNamesArabic = new()
    {
        [LeaveType.Annual] = "سنوية",
        [LeaveType.Sick] = "مرضية",
        [LeaveType.Unpaid] = "بدون راتب",
        [LeaveType.Maternity] = "أمومة",
        [LeaveType.Emergency] = "طارئة",
        [LeaveType.Other] = "أخرى"
    };

    private readonly ILeaveRequestRepository _repository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public LeaveRequestService(
        ILeaveRequestRepository repository,
        IAttendanceRepository attendanceRepository,
        INotificationService notificationService,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _attendanceRepository = attendanceRepository;
        _notificationService = notificationService;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<LeaveRequestListItemResponse>> GetAllAsync(
        int page, int pageSize,
        Guid? employeeId, LeaveStatus? status, LeaveType? leaveType,
        DateTime? dateFrom, DateTime? dateTo)
        => await _repository.GetAllAsync(page, pageSize, employeeId, status, leaveType, dateFrom, dateTo);

    public async Task<LeaveRequestResponse> GetByIdAsync(Guid id)
    {
        var leaveRequest = await _repository.GetByIdAsync(id);
        if (leaveRequest is null) throw new NotFoundException(nameof(LeaveRequest), id);
        return leaveRequest;
    }

    public async Task<LeaveRequestResponse> CreateAsync(CreateLeaveRequestRequest request)
    {
        // 1. Validate Employee exists and is not terminated
        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId)
            ?? throw new NotFoundException(nameof(Employee), request.EmployeeId);

        if (employee.Status == EmployeeStatus.Terminated)
            throw new BusinessException("لا يمكن تسجيل إجازة لموظف منتهي الخدمة.");

        // 2. Validate date range and duration
        ValidateDateRange(request.StartDate, request.EndDate);

        // 3. Prevent overlapping Pending/Approved leaves for the same employee
        if (await _repository.HasOverlappingAsync(request.EmployeeId, request.StartDate, request.EndDate, null))
            throw new BusinessException("يوجد طلب إجازة متداخل لنفس الموظف في هذه الفترة.");

        var leaveRequest = new LeaveRequest
        {
            EmployeeId = request.EmployeeId,
            LeaveType = request.LeaveType,
            StartDate = request.StartDate.Date,
            EndDate = request.EndDate.Date,
            DaysRequested = CalculateDays(request.StartDate, request.EndDate),
            Status = LeaveStatus.Pending,
            Reason = request.Reason.Trim(),
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(leaveRequest);

        await _notificationService.CreateForRoleAsync(
            Roles.SuperAdmin,
            NotificationType.LeaveRequestSubmitted,
            "طلب إجازة جديد",
            $"طلب إجازة للموظف {employee.FirstName} {employee.LastName} بانتظار الاعتماد",
            leaveRequest.Id);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(leaveRequest.Id);
    }

    public async Task<LeaveRequestResponse> UpdateAsync(Guid id, UpdateLeaveRequestRequest request)
    {
        var leaveRequest = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(LeaveRequest), id);

        if (leaveRequest.Status != LeaveStatus.Pending)
            throw new BusinessException("لا يمكن تعديل طلب الإجازة إلا في حالة الانتظار.");

        ValidateDateRange(request.StartDate, request.EndDate);

        if (await _repository.HasOverlappingAsync(leaveRequest.EmployeeId, request.StartDate, request.EndDate, id))
            throw new BusinessException("يوجد طلب إجازة متداخل لنفس الموظف في هذه الفترة.");

        leaveRequest.LeaveType = request.LeaveType;
        leaveRequest.StartDate = request.StartDate.Date;
        leaveRequest.EndDate = request.EndDate.Date;
        leaveRequest.DaysRequested = CalculateDays(request.StartDate, request.EndDate);
        leaveRequest.Reason = request.Reason.Trim();
        leaveRequest.UpdatedBy = _currentUserService.UserId;
        leaveRequest.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<LeaveRequestResponse> ApproveAsync(Guid id)
    {
        var leaveRequest = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(LeaveRequest), id);

        if (leaveRequest.Status != LeaveStatus.Pending)
            throw new BusinessException("لا يمكن اعتماد الطلب إلا في حالة الانتظار.");

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == leaveRequest.EmployeeId)
            ?? throw new NotFoundException(nameof(Employee), leaveRequest.EmployeeId);

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            leaveRequest.Status = LeaveStatus.Approved;
            leaveRequest.ApprovedBy = _currentUserService.UserId;
            leaveRequest.ApprovedAt = DateTime.UtcNow;
            leaveRequest.UpdatedBy = _currentUserService.UserId;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            // Record Leave attendance days (skip weekends and existing records)
            await SyncAttendanceAsync(leaveRequest, _currentUserService.UserId);

            // Notify the employee's linked system user, if any
            if (employee.UserId.HasValue)
            {
                await _notificationService.CreateForUserAsync(
                    employee.UserId.Value,
                    NotificationType.LeaveRequestApproved,
                    "تم اعتماد طلب الإجازة",
                    $"تم اعتماد إجازتك من {leaveRequest.StartDate:yyyy-MM-dd} إلى {leaveRequest.EndDate:yyyy-MM-dd}",
                    leaveRequest.Id);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return await GetByIdAsync(leaveRequest.Id);
    }

    public async Task<LeaveRequestResponse> RejectAsync(Guid id, RejectLeaveRequestRequest request)
    {
        var leaveRequest = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(LeaveRequest), id);

        if (leaveRequest.Status != LeaveStatus.Pending)
            throw new BusinessException("لا يمكن رفض الطلب إلا في حالة الانتظار.");

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == leaveRequest.EmployeeId)
            ?? throw new NotFoundException(nameof(Employee), leaveRequest.EmployeeId);

        leaveRequest.Status = LeaveStatus.Rejected;
        leaveRequest.DecisionNote = request.DecisionNote.Trim();
        leaveRequest.UpdatedBy = _currentUserService.UserId;
        leaveRequest.UpdatedAt = DateTime.UtcNow;

        if (employee.UserId.HasValue)
        {
            await _notificationService.CreateForUserAsync(
                employee.UserId.Value,
                NotificationType.LeaveRequestRejected,
                "تم رفض طلب الإجازة",
                $"تم رفض طلب الإجازة الخاص بك. السبب: {leaveRequest.DecisionNote}",
                leaveRequest.Id);
        }

        await _context.SaveChangesAsync();

        return await GetByIdAsync(leaveRequest.Id);
    }

    public async Task<LeaveRequestResponse> CancelAsync(Guid id, CancelLeaveRequestRequest? request)
    {
        var leaveRequest = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(LeaveRequest), id);

        if (leaveRequest.Status is not (LeaveStatus.Pending or LeaveStatus.Approved))
            throw new BusinessException("لا يمكن إلغاء الطلب في حالته الحالية.");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // If the leave was approved, remove the auto-created Leave attendance days
            if (leaveRequest.Status == LeaveStatus.Approved)
            {
                var records = await _attendanceRepository.GetByEmployeeAndDateRangeAsync(
                    leaveRequest.EmployeeId, leaveRequest.StartDate, leaveRequest.EndDate);

                var note = BuildLeaveNote(leaveRequest.LeaveType);
                var ids = records
                    .Where(a => a.Status == AttendanceStatus.Leave && a.Notes == note)
                    .Select(a => a.Id)
                    .ToList();

                await _attendanceRepository.SoftDeleteRangeAsync(ids, _currentUserService.UserId!.Value);
            }

            leaveRequest.Status = LeaveStatus.Cancelled;
            if (!string.IsNullOrWhiteSpace(request?.DecisionNote))
                leaveRequest.DecisionNote = request.DecisionNote.Trim();
            leaveRequest.UpdatedBy = _currentUserService.UserId;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return await GetByIdAsync(leaveRequest.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var leaveRequest = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(LeaveRequest), id);

        if (leaveRequest.Status != LeaveStatus.Pending)
            throw new BusinessException("لا يمكن حذف طلب الإجازة إلا في حالة الانتظار.");

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }

    public async Task<LeaveSummaryResponse> GetYearSummaryAsync(Guid employeeId, int year)
    {
        var exists = await _context.Employees.AnyAsync(e => e.Id == employeeId);
        if (!exists) throw new NotFoundException(nameof(Employee), employeeId);

        if (year < 2000 || year > 2100)
            throw new BusinessException("السنة غير صحيحة.");

        return await _repository.GetYearSummaryAsync(employeeId, year);
    }

    private async Task SyncAttendanceAsync(LeaveRequest leaveRequest, Guid? userId)
    {
        var existing = await _attendanceRepository.GetByEmployeeAndDateRangeAsync(
            leaveRequest.EmployeeId, leaveRequest.StartDate, leaveRequest.EndDate);

        var existingDates = existing.Select(a => a.Date.Date).ToHashSet();
        var note = BuildLeaveNote(leaveRequest.LeaveType);
        var records = new List<Attendance>();

        for (var date = leaveRequest.StartDate.Date; date <= leaveRequest.EndDate.Date; date = date.AddDays(1))
        {
            // Friday and Saturday are the weekly weekend
            if (date.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Saturday)
                continue;

            if (existingDates.Contains(date))
                continue;

            records.Add(new Attendance
            {
                EmployeeId = leaveRequest.EmployeeId,
                Date = date,
                CheckIn = null,
                CheckOut = null,
                WorkHours = null,
                OvertimeHours = 0,
                BreakMinutes = 60,
                Status = AttendanceStatus.Leave,
                Notes = note,
                RecordedBy = userId,
                CreatedBy = userId
            });
        }

        if (records.Count > 0)
            await _attendanceRepository.AddRangeAsync(records);
    }

    private static string BuildLeaveNote(LeaveType leaveType)
        => $"إجازة {LeaveTypeNamesArabic[leaveType]}";

    private static int CalculateDays(DateTime startDate, DateTime endDate)
        => (endDate.Date - startDate.Date).Days + 1;

    private static void ValidateDateRange(DateTime startDate, DateTime endDate)
    {
        if (endDate.Date < startDate.Date)
            throw new BusinessException("تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساوياً له.");

        if (CalculateDays(startDate, endDate) > MaxLeaveDays)
            throw new BusinessException($"مدة الإجازة يجب ألا تتجاوز {MaxLeaveDays} يوماً.");
    }
}
