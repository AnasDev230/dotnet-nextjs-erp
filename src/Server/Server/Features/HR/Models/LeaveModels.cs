using Server.Features.HR.Enums;

namespace Server.Features.HR.Models;

// ─── Requests ───

public class CreateLeaveRequestRequest
{
    public Guid EmployeeId { get; set; }
    public LeaveType LeaveType { get; set; } = LeaveType.Annual;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class UpdateLeaveRequestRequest
{
    public LeaveType LeaveType { get; set; } = LeaveType.Annual;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class RejectLeaveRequestRequest
{
    public string DecisionNote { get; set; } = string.Empty;
}

public class CancelLeaveRequestRequest
{
    public string? DecisionNote { get; set; }
}

// ─── Responses ───

public class LeaveRequestResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public LeaveType LeaveType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysRequested { get; set; }
    public LeaveStatus Status { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? DecisionNote { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class LeaveRequestListItemResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public LeaveType LeaveType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysRequested { get; set; }
    public LeaveStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LeaveSummaryResponse
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int TotalApprovedDays { get; set; }
    public List<LeaveTypeSummaryItemResponse> ByType { get; set; } = new();
}

public class LeaveTypeSummaryItemResponse
{
    public LeaveType LeaveType { get; set; }
    public int DaysUsed { get; set; }
    public int RequestCount { get; set; }
}
