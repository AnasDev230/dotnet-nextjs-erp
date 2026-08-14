using Server.Features.Search.Models;

namespace Server.Features.Search.Repositories;

public interface ISearchRepository
{
    Task<SearchResultResponse> SearchAsync(string query, int limitPerCategory = 5);
}