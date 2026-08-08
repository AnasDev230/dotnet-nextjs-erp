namespace Server.Features.HR.Models;

public class CreateDepartmentRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public Guid? ManagerId { get; set; }
    public string? Description { get; set; }
}