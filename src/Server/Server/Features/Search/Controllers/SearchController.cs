using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Features.Search.Models;
using Server.Features.Search.Services;

namespace Server.Features.Search.Controllers;

[ApiController]
[Route("api/search")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ISearchService _service;
    public SearchController(ISearchService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int limit = 5)
    {
        var result = await _service.SearchAsync(q, limit);
        return Ok(ApiResponse<SearchResultResponse>.SuccessResult(result));
    }
}