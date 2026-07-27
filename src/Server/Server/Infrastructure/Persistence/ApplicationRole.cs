using Microsoft.AspNetCore.Identity;

namespace Server.Infrastructure.Persistence;

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }

    public bool IsSystemRole { get; set; }
}
