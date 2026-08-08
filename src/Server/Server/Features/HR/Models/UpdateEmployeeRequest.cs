using Server.Features.HR.Enums;

namespace Server.Features.HR.Models;

public class UpdateEmployeeRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateOnly HireDate { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? JobTitle { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public decimal Salary { get; set; }
    public Guid? ManagerId { get; set; }
    public EmployeeStatus Status { get; set; }
    public Guid? UserId { get; set; }
    public string? Notes { get; set; }
}