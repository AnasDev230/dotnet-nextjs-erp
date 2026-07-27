using FluentValidation;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Validators;

public class UpdateWarehouseValidator : AbstractValidator<UpdateWarehouseRequest>
{
    public UpdateWarehouseValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.Location)
            .MaximumLength(500);
    }
}
