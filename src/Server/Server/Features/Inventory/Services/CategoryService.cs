using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Inventory.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CategoryService(
        ICategoryRepository categoryRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _categoryRepository = categoryRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<CategoryListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm)
    {
        return await _categoryRepository.GetAllAsync(page, pageSize, searchTerm);
    }

    public async Task<CategoryResponse> GetByIdAsync(Guid id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category is null)
            throw new NotFoundException(nameof(Category), id);

        return category;
    }

    public async Task<List<CategoryListItemResponse>> GetAllForDropdownAsync()
    {
        return await _categoryRepository.GetAllForDropdownAsync();
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
    {
        if (await _categoryRepository.ExistsByCodeAsync(request.Code))
            throw new BusinessException($"Category with code '{request.Code}' already exists.");

        var category = new Category
        {
            Code = request.Code,
            Name = request.Name,
            ParentId = request.ParentId,
            CreatedBy = _currentUserService.UserId
        };

        await _categoryRepository.AddAsync(category);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(category.Id);
    }

    public async Task<CategoryResponse> UpdateAsync(Guid id, UpdateCategoryRequest request)
    {
        if (request.ParentId == id)
            throw new BusinessException("A category cannot be its own parent.");

        var category = await _categoryRepository.GetEntityByIdAsync(id);
        if (category is null)
            throw new NotFoundException(nameof(Category), id);

        category.Name = request.Name;
        category.ParentId = request.ParentId;
        category.UpdatedBy = _currentUserService.UserId;

        _categoryRepository.Update(category);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var category = await _categoryRepository.GetEntityByIdAsync(id);
        if (category is null)
            throw new NotFoundException(nameof(Category), id);

        if (await _categoryRepository.HasSubCategoriesAsync(id))
            throw new BusinessException("Cannot delete category with sub-categories. Remove or reassign sub-categories first.");

        _categoryRepository.SoftDelete(category);
        category.UpdatedBy = _currentUserService.UserId;
        await _context.SaveChangesAsync();
    }
}
