namespace Server.Features.Settings.Models;

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}