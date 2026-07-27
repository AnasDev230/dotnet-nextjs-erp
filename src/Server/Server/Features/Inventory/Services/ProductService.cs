using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ProductService(
        IProductRepository productRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _productRepository = productRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<ProductListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm, Guid? categoryId, bool? isActive)
    {
        return await _productRepository.GetAllAsync(page, pageSize, searchTerm, categoryId, isActive);
    }

    public async Task<ProductResponse> GetByIdAsync(Guid id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product is null)
            throw new NotFoundException(nameof(Product), id);

        return product;
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request)
    {
        if (await _productRepository.ExistsBySkuAsync(request.Sku))
            throw new BusinessException($"Product with SKU '{request.Sku}' already exists.");

        var product = new Product
        {
            Sku = request.Sku,
            Name = request.Name,
            Description = request.Description,
            CategoryId = request.CategoryId,
            UnitOfMeasure = request.UnitOfMeasure,
            ReorderLevel = request.ReorderLevel,
            ReorderQty = request.ReorderQty,
            SalePrice = request.SalePrice,
            IsActive = true,
            CreatedBy = _currentUserService.UserId
        };

        await _productRepository.AddAsync(product);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(product.Id);
    }

    public async Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest request)
    {
        var product = await _productRepository.GetEntityByIdAsync(id);
        if (product is null)
            throw new NotFoundException(nameof(Product), id);

        product.Name = request.Name;
        product.Description = request.Description;
        product.CategoryId = request.CategoryId;
        product.UnitOfMeasure = request.UnitOfMeasure;
        product.ReorderLevel = request.ReorderLevel;
        product.ReorderQty = request.ReorderQty;
        product.SalePrice = request.SalePrice;
        product.IsActive = request.IsActive;
        product.UpdatedBy = _currentUserService.UserId;

        _productRepository.Update(product);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var product = await _productRepository.GetEntityByIdAsync(id);
        if (product is null)
            throw new NotFoundException(nameof(Product), id);

        _productRepository.SoftDelete(product);
        product.UpdatedBy = _currentUserService.UserId;
        await _context.SaveChangesAsync();
    }
}
