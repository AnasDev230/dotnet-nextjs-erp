namespace Server.Features.Settings.Models;

public class ProfileResponse
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTime? LastLogin { get; set; }
}