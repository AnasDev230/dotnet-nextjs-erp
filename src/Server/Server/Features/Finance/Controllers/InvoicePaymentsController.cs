using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Finance.Models;
using Server.Features.Finance.Services;

namespace Server.Features.Finance.Controllers;

[ApiController]
[Route("api/invoices/{invoiceId:guid}/payments")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
public class InvoicePaymentsController : ControllerBase
{
    private readonly IPaymentService _service;

    public InvoicePaymentsController(IPaymentService service) => _service = service;

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PaymentResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(Guid invoiceId, [FromBody] CreatePaymentRequest request)
    {
        var result = await _service.CreateAsync(invoiceId, request);
        return Ok(ApiResponse<PaymentResponse>.SuccessResult(result));
    }

    [HttpGet]
    public async Task<IActionResult> GetByInvoice(Guid invoiceId)
    {
        var result = await _service.GetByInvoiceIdAsync(invoiceId);
        return Ok(ApiResponse<List<PaymentListItemResponse>>.SuccessResult(result));
    }
}
