using Server.Features.HR.Enums;

namespace Server.Features.HR.Models;

public class EmployeeListItemResponse
{
    public Guid Id { get; set; }
    public string EmployeeNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? JobTitle { get; set; }
    public EmployeeStatus Status { get; set; }
    public DateOnly HireDate { get; set; }
}