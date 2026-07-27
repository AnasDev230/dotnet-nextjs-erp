using FluentValidation;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;

namespace Server.Features.Inventory.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator(IProductRepository productRepository)
    {
        RuleFor(x => x.Sku)
            .NotEmpty()
            .MaximumLength(50)
            .MustAsync(async (sku, _) => !await productRepository.ExistsBySkuAsync(sku))
            .WithMessage("SKU already exists.");

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

        RuleFor(x => x.SalePrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("سعر البيع يجب أن يكون 0 أو أكثر");
    }
}
