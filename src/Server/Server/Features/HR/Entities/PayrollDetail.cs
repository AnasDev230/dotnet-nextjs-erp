using Server.Core.Common;

namespace Server.Features.HR.Entities;

public class PayrollDetail : BaseEntity
{
    public Guid PayrollRunId { get; set; }
    public PayrollRun PayrollRun { get; set; } = null!;

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    // ─── Earnings ───
    public decimal BaseSalary { get; set; }
    public decimal TransportAllowance { get; set; }
    public decimal HousingAllowance { get; set; }
    public decimal OvertimePay { get; set; }
    public decimal OtherAllowances { get; set; }
    public decimal TotalEarnings { get; set; }

    // ─── Deductions ───
    public decimal LateDeduction { get; set; }
    public decimal AbsentDeduction { get; set; }
    public decimal InsuranceDeduction { get; set; }
    public decimal OtherDeductions { get; set; }
    public decimal TotalDeductions { get; set; }

    // ─── Net ───
    public decimal NetPay { get; set; }

    // ─── Attendance summary ───
    public int PresentDays { get; set; }
    public int LateDays { get; set; }
    public int AbsentDays { get; set; }
    public decimal OvertimeHours { get; set; }

    /// <summary>Notes.</summary>
    public string? Notes { get; set; }
}
