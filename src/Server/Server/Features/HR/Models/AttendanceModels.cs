using Server.Features.HR.Enums;

namespace Server.Features.HR.Models;

// ─── Requests ───

public class CreateAttendanceRequest
{
    public Guid EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan? CheckIn { get; set; }
    public TimeSpan? CheckOut { get; set; }
    public int BreakMinutes { get; set; } = 60;
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public string? Notes { get; set; }
}

public class UpdateAttendanceRequest
{
    public TimeSpan? CheckIn { get; set; }
    public TimeSpan? CheckOut { get; set; }
    public int BreakMinutes { get; set; } = 60;
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public string? Notes { get; set; }
}

public class BulkAttendanceRequest
{
    public DateTime Date { get; set; }
    public List<BulkAttendanceItemRequest> Items { get; set; } = new();
}

public class BulkAttendanceItemRequest
{
    public Guid EmployeeId { get; set; }
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public TimeSpan? CheckIn { get; set; }
    public TimeSpan? CheckOut { get; set; }
    public string? Notes { get; set; }
}

// ─── Responses ───

public class AttendanceResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan? CheckIn { get; set; }
    public TimeSpan? CheckOut { get; set; }
    public decimal? WorkHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public int BreakMinutes { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
    public Guid? RecordedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class AttendanceListItemResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan? CheckIn { get; set; }
    public TimeSpan? CheckOut { get; set; }
    public decimal? WorkHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public int BreakMinutes { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AttendanceSummaryResponse
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalDays { get; set; }
    public int PresentDays { get; set; }
    public int LateDays { get; set; }
    public int AbsentDays { get; set; }
    public int LeaveDays { get; set; }
    public int HalfDayCount { get; set; }
    public decimal TotalWorkHours { get; set; }
    public decimal TotalOvertimeHours { get; set; }
}
