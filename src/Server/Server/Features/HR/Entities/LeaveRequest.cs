using Server.Core.Common;
using Server.Features.HR.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Entities;

/// <summary>
/// Represents a leave request for an employee, following the workflow:
/// Pending → Approved | Rejected, and Pending/Approved → Cancelled.
/// Approving a request also records Leave-status attendance days
/// (excluding weekends) for the requested period.
/// </summary>
public class LeaveRequest : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public LeaveType LeaveType { get; set; } = LeaveType.Annual;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    /// <summary>Calendar days (inclusive of both start and end dates).</summary>
    public int DaysRequested { get; set; }

    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;

    /// <summary>Reason submitted with the request.</summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>Decision note (rejection or cancellation reason).</summary>
    public string? DecisionNote { get; set; }

    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    // Navigation
    public ApplicationUser? Approver { get; set; }
}
