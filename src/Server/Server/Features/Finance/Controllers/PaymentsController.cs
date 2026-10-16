using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Finance.Enums;
using Server.Features.Finance.Models;
using Server.Features.Finance.Services;

namespace Server.Features.Finance.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentsController(IPaymentService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] PaymentMethod? method = null,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, method, fromDate, toDate);
        return Ok(ApiResponse<PagedResult<PaymentListResponse>>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Payment deleted successfully"));
    }
}

