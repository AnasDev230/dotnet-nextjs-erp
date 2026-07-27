using FluentValidation;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Validators;

public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.UnitOfMeasure)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.ReorderLevel)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.ReorderQty)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.IsActive)
            .NotNull();

        RuleFor(x => x.SalePrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("سعر البيع يجب أن يكون 0 أو أكثر");
    }
}
