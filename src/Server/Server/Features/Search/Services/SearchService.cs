using Server.Features.Search.Models;
using Server.Features.Search.Repositories;

namespace Server.Features.Search.Services;

public class SearchService : ISearchService
{
    private readonly ISearchRepository _repository;
    public SearchService(ISearchRepository repository) => _repository = repository;

    public async Task<SearchResultResponse> SearchAsync(string query, int limitPerCategory = 5)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
            return new SearchResultResponse();

        return await _repository.SearchAsync(query.Trim(), limitPerCategory);
    }
}