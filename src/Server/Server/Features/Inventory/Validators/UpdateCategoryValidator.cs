using FluentValidation;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;

namespace Server.Features.Inventory.Validators;

public class UpdateCategoryValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryValidator(ICategoryRepository categoryRepository)
    {
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
