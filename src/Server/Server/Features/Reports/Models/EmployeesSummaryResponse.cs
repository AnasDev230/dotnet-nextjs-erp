namespace Server.Features.Reports.Models;

public class EmployeesSummaryResponse
{
    public int TotalEmployees { get; set; }
    public int ActiveCount { get; set; }
    public int OnLeaveCount { get; set; }
    public int TerminatedCount { get; set; }
    public decimal TotalSalaries { get; set; }
    public List<EmployeesByDepartmentItem> ByDepartment { get; set; } = new();
}

public class EmployeesByDepartmentItem
{
    public Guid? DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    public decimal TotalSalaries { get; set; }
}