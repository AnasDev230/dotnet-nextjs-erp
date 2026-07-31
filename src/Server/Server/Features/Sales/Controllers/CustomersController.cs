using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Sales.Models;
using Server.Features.Sales.Services;

namespace Server.Features.Sales.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager},{Roles.WarehouseKeeper}")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] CustomerStatus? status = null,
        [FromQuery] CustomerType? type = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, status, type);
        return Ok(ApiResponse<PagedResult<CustomerListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetForDropdown()
    {
        var result = await _service.GetAllForDropdownAsync();
        return Ok(ApiResponse<List<CustomerListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<CustomerResponse>.SuccessResult(result));
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
    [ProducesResponseType(typeof(ApiResponse<CustomerResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<CustomerResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<CustomerResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.SalesManager}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Customer deleted successfully"));
    }
}
