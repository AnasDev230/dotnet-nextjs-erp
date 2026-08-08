using Server.Core.Common;
using Server.Features.HR.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Entities;
/// <summary>
/// Represents an employee record in the HR module.
/// 
/// Note on Email/Phone duplication with AspNetUsers:
/// This entity intentionally maintains its own Email and Phone fields,
/// separate from AspNetUsers.Email and AspNetUsers.PhoneNumber.
/// 
/// Rationale:
/// - employees.Email = Official HR contact email (managed by HR department)
/// - AspNetUsers.Email = System login credential (managed by IT department)
/// - Not all employees have system accounts (user_id is nullable)
/// - Deleting a user account must NOT erase HR employee data
/// - Follows standard ERP design patterns (SAP, Oracle, Dynamics)
/// </summary>
public class Employee : BaseEntity
{
    public string EmployeeNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    /// <summary>
    /// Official HR contact email. Intentionally separate from AspNetUsers.Email.
    /// HR manages this field independently of IT/system credentials.
    /// </summary>
    public string? Email { get; set; }
    /// <summary>
    /// Official HR contact phone. Intentionally separate from AspNetUsers.PhoneNumber.
    /// HR manages this field independently of IT/system credentials.
    /// </summary>
    public string? Phone { get; set; }
    public DateOnly HireDate { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? JobTitle { get; set; }
    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
    public decimal Salary { get; set; }
    public string Currency { get; set; } = "SAR";
    public Guid? ManagerId { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
    /// <summary>
    /// Optional link to AspNetUsers for system access.
    /// Nullable because not all employees require system accounts.
    /// When linked, system login uses AspNetUsers.Email (not this entity's Email).
    /// </summary>
    public Guid? UserId { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Department? Department { get; set; }
    public Employee? Manager { get; set; }
    public ICollection<Employee> Subordinates { get; set; } = new List<Employee>();
    public ApplicationUser? User { get; set; }
}