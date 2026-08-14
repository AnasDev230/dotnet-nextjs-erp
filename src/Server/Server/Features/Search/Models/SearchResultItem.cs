namespace Server.Features.Search.Models;

public class SearchResultItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}