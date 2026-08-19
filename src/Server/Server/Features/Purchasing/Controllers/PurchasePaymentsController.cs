using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Services;

namespace Server.Features.Purchasing.Controllers;

[ApiController]
[Route("api/purchase-payments")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager}")]
public class PurchasePaymentsController : ControllerBase
{
    private readonly IPurchasePaymentService _service;

    public PurchasePaymentsController(IPurchasePaymentService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? supplierInvoiceId = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, supplierInvoiceId);
        return Ok(ApiResponse<PagedResult<PurchasePaymentResponse>>.SuccessResult(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PurchasePaymentResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePurchasePaymentRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetAll), new { }, ApiResponse<PurchasePaymentResponse>.SuccessResult(result));
    }
}