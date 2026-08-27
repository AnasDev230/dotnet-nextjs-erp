using Server.Core.Common;
using Server.Features.HR.Enums;

namespace Server.Features.HR.Entities;

public class PayrollRun : BaseEntity
{
    /// <summary>Auto-generated: PAY-YYYY-MM</summary>
    public string RunNumber { get; set; } = string.Empty;

    /// <summary>Month this payroll covers.</summary>
    public int Month { get; set; }

    /// <summary>Year this payroll covers.</summary>
    public int Year { get; set; }

    /// <summary>Status of the payroll run.</summary>
    public PayrollStatus Status { get; set; } = PayrollStatus.Draft;

    /// <summary>Total amount for all employees.</summary>
    public decimal TotalNetAmount { get; set; }

    /// <summary>Number of employees in this run.</summary>
    public int EmployeeCount { get; set; }

    /// <summary>When it was processed.</summary>
    public DateTime? ProcessedAt { get; set; }

    /// <summary>When it was marked as paid.</summary>
    public DateTime? PaidAt { get; set; }

    /// <summary>Notes.</summary>
    public string? Notes { get; set; }

    // Navigation
    public ICollection<PayrollDetail> Details { get; set; } = new List<PayrollDetail>();
}
