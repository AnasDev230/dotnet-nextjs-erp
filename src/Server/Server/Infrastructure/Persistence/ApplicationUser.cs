using Microsoft.AspNetCore.Identity;

namespace Server.Infrastructure.Persistence;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLogin { get; set; }

    public Guid? EmployeeId { get; set; }
}
