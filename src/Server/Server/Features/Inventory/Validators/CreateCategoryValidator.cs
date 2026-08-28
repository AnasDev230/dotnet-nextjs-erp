using FluentValidation;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Validators;

public class CreateCategoryValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.ParentId)
            .NotNull()
            .When(x => x.ParentId.HasValue);
    }
}
