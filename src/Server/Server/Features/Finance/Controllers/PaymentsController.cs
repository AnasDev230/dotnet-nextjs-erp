using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Finance.Services;

namespace Server.Features.Finance.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentsController(IPaymentService service) => _service = service;

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Payment deleted successfully"));
    }
}
