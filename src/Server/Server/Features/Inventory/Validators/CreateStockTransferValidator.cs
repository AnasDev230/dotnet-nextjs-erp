using FluentValidation;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Validators;

public class CreateStockTransferValidator : AbstractValidator<CreateStockTransferRequest>
{
    public CreateStockTransferValidator()
    {
        RuleFor(x => x.FromWarehouseId)
            .NotEmpty();

        RuleFor(x => x.ToWarehouseId)
            .NotEmpty();

        RuleFor(x => x)
            .Must(x => x.FromWarehouseId != x.ToWarehouseId)
            .WithMessage("Source and destination warehouses cannot be the same.");

        RuleFor(x => x.ProductId)
            .NotEmpty();

        RuleFor(x => x.Quantity)
            .GreaterThan(0);

        RuleFor(x => x.Notes)
            .MaximumLength(1000);
    }
}
