using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory;
using Server.Features.Inventory.Repositories;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Purchasing.Services;

public class ProductSupplierService : IProductSupplierService
{
    private readonly IProductSupplierRepository _repository;
    private readonly IProductRepository _productRepository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ProductSupplierService(
        IProductSupplierRepository repository,
        IProductRepository productRepository,
        ISupplierRepository supplierRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _productRepository = productRepository;
        _supplierRepository = supplierRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ProductSupplierResponse> CreateAsync(CreateProductSupplierRequest request)
    {
        var product = await _productRepository.GetEntityByIdAsync(request.ProductId)
            ?? throw new NotFoundException(nameof(Product), request.ProductId);

        if (!product.IsActive)
            throw new BusinessException("لا يمكن ربط منتج غير نشط");

        var supplier = await _supplierRepository.GetEntityByIdAsync(request.SupplierId)
            ?? throw new NotFoundException(nameof(Supplier), request.SupplierId);

        if (supplier.Status != SupplierStatus.Active)
            throw new BusinessException("لا يمكن ربط مورد غير نشط");

        if (await _repository.ExistsAsync(request.ProductId, request.SupplierId))
            throw new BusinessException("هذا المنتج مرتبط بهذا المورد بالفعل");

        var link = new ProductSupplier
        {
            ProductId = request.ProductId,
            SupplierId = request.SupplierId,
            SupplierSku = request.SupplierSku,
            LeadTimeDays = request.LeadTimeDays,
            MinOrderQty = request.MinOrderQty,
            UnitCost = request.UnitCost,
            IsPrimary = request.IsPrimary,
            CreatedBy = _currentUserService.UserId
        };

        if (request.IsPrimary)
            await _repository.UnsetPrimaryAsync(request.ProductId, Guid.Empty);

        await _repository.AddAsync(link);
        await _context.SaveChangesAsync();

        return await _repository.GetByIdAsync(link.Id)
            ?? throw new BusinessException("تعذر تحميل الارتباط بعد إنشائه");
    }

    public async Task<List<ProductSupplierListItemResponse>> GetByProductIdAsync(Guid productId)
        => await _repository.GetByProductIdAsync(productId);

    public async Task<ProductSupplierResponse> GetByIdAsync(Guid id)
        => await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(ProductSupplier), id);

    public async Task<List<ProductSupplierListItemResponse>> GetBySupplierIdAsync(Guid supplierId)
        => await _repository.GetBySupplierIdAsync(supplierId);

    public async Task<ProductSupplierResponse> UpdateAsync(Guid id, UpdateProductSupplierRequest request)
    {
        var link = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(ProductSupplier), id);

        link.SupplierSku = request.SupplierSku;
        link.LeadTimeDays = request.LeadTimeDays;
        link.MinOrderQty = request.MinOrderQty;
        link.UnitCost = request.UnitCost;
        link.IsPrimary = request.IsPrimary;
        link.UpdatedBy = _currentUserService.UserId;

        if (request.IsPrimary)
            await _repository.UnsetPrimaryAsync(link.ProductId, link.Id);

        await _context.SaveChangesAsync();

        return await _repository.GetByIdAsync(id)
            ?? throw new BusinessException("تعذر تحميل الارتباط بعد تحديثه");
    }

    public async Task DeleteAsync(Guid id)
    {
        var link = await _repository.GetEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(ProductSupplier), id);

        await _repository.SoftDeleteAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }
}