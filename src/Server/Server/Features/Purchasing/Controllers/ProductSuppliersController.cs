using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Core.Constants;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Services;

namespace Server.Features.Purchasing.Controllers;

[ApiController]
[Route("api/product-suppliers")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.PurchasingManager},{Roles.WarehouseKeeper}")]
public class ProductSuppliersController : ControllerBase
{
    private readonly IProductSupplierService _service;

    public ProductSuppliersController(IProductSupplierService service) => _service = service;

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ProductSupplierResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateProductSupplierRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<ProductSupplierResponse>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<ProductSupplierResponse>.SuccessResult(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductSupplierRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse<ProductSupplierResponse>.SuccessResult(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResult("Product-supplier link deleted successfully"));
    }

    [HttpGet("by-product/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId)
    {
        var result = await _service.GetByProductIdAsync(productId);
        return Ok(ApiResponse<List<ProductSupplierListItemResponse>>.SuccessResult(result));
    }

    [HttpGet("by-supplier/{supplierId:guid}")]
    public async Task<IActionResult> GetBySupplier(Guid supplierId)
    {
        var result = await _service.GetBySupplierIdAsync(supplierId);
        return Ok(ApiResponse<List<ProductSupplierListItemResponse>>.SuccessResult(result));
    }
}