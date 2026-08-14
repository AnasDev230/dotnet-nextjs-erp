using Server.Features.Search.Models;

namespace Server.Features.Search.Services;

public interface ISearchService
{
    Task<SearchResultResponse> SearchAsync(string query, int limitPerCategory = 5);
}