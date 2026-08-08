using Server.Features.HR.Enums;

namespace Server.Features.HR.Models;

public class EmployeeResponse
{
    public Guid Id { get; set; }
    public string EmployeeNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateOnly HireDate { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? JobTitle { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public decimal Salary { get; set; }
    public string Currency { get; set; } = string.Empty;
    public Guid? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public EmployeeStatus Status { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}