namespace Server.Features.HR.Models;

public class DepartmentListItemResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ParentName { get; set; }
    public string? ManagerName { get; set; }
    public int EmployeeCount { get; set; }
    public bool IsActive { get; set; }
}