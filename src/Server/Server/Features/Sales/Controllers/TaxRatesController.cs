using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Sales.Models;
using Server.Features.Sales.Repositories;

namespace Server.Features.Sales.Controllers;

[ApiController]
[Route("api/tax-rates")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager},{Roles.WarehouseKeeper}")]
public class TaxRatesController : ControllerBase
{
    private readonly ITaxRateRepository _repository;

    public TaxRatesController(ITaxRateRepository repository) => _repository = repository;

    [HttpGet]
    public async Task<IActionResult> GetActive()
    {
        var result = await _repository.GetActiveAsync();
        return Ok(ApiResponse<List<TaxRateResponse>>.SuccessResult(result));
    }
}
