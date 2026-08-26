using Server.Core.Common;
using Server.Features.HR.Enums;

namespace Server.Features.HR.Entities;

public class Attendance : BaseEntity
{
    /// <summary>Employee.</summary>
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    /// <summary>Date of attendance.</summary>
    public DateTime Date { get; set; }

    /// <summary>Check-in time.</summary>
    public TimeSpan? CheckIn { get; set; }

    /// <summary>Check-out time.</summary>
    public TimeSpan? CheckOut { get; set; }

    /// <summary>Calculated work hours (CheckOut - CheckIn - BreakMinutes).</summary>
    public decimal? WorkHours { get; set; }

    /// <summary>Overtime hours (if worked beyond standard).</summary>
    public decimal OvertimeHours { get; set; }

    /// <summary>Break duration in minutes.</summary>
    public int BreakMinutes { get; set; } = 60;

    /// <summary>Status.</summary>
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;

    /// <summary>Notes (reason for late, absent, etc.).</summary>
    public string? Notes { get; set; }

    /// <summary>Who recorded this (HR or self).</summary>
    public Guid? RecordedBy { get; set; }
}
