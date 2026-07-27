using FluentValidation;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;

namespace Server.Features.Inventory.Validators;

public class CreateCategoryValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryValidator(ICategoryRepository categoryRepository)
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .MaximumLength(50)
            .MustAsync(async (code, _) => !await categoryRepository.ExistsByCodeAsync(code))
            .WithMessage("Category code already exists.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.ParentId)
            .MustAsync(async (parentId, _) =>
            {
                if (!parentId.HasValue) return true;
                return await categoryRepository.ExistsByIdAsync(parentId.Value);
            })
            .WithMessage("Parent category does not exist.")
            .When(x => x.ParentId.HasValue);
    }
}
