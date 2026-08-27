using Server.Features.HR.Enums;

namespace Server.Features.HR.Models;

// ─── Requests ───

public class CreatePayrollRunRequest
{
    public int Month { get; set; }
    public int Year { get; set; }
    public string? Notes { get; set; }
}

// ─── Responses ───

public class PayrollRunResponse
{
    public Guid Id { get; set; }
    public string RunNumber { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public PayrollStatus Status { get; set; }
    public decimal TotalNetAmount { get; set; }
    public int EmployeeCount { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PayrollRunListItemResponse
{
    public Guid Id { get; set; }
    public string RunNumber { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public PayrollStatus Status { get; set; }
    public decimal TotalNetAmount { get; set; }
    public int EmployeeCount { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PayrollDetailResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;

    // Earnings
    public decimal BaseSalary { get; set; }
    public decimal TransportAllowance { get; set; }
    public decimal HousingAllowance { get; set; }
    public decimal OvertimePay { get; set; }
    public decimal OtherAllowances { get; set; }
    public decimal TotalEarnings { get; set; }

    // Deductions
    public decimal LateDeduction { get; set; }
    public decimal AbsentDeduction { get; set; }
    public decimal InsuranceDeduction { get; set; }
    public decimal OtherDeductions { get; set; }
    public decimal TotalDeductions { get; set; }

    // Net
    public decimal NetPay { get; set; }

    // Attendance
    public int PresentDays { get; set; }
    public int LateDays { get; set; }
    public int AbsentDays { get; set; }
    public decimal OvertimeHours { get; set; }

    public string? Notes { get; set; }
}

public class PayrollDetailListItemResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public decimal BaseSalary { get; set; }
    public decimal TotalEarnings { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal NetPay { get; set; }
    public int PresentDays { get; set; }
    public int LateDays { get; set; }
    public int AbsentDays { get; set; }
}
