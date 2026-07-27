using FluentValidation;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;

namespace Server.Features.Inventory.Validators;

public class CreateWarehouseValidator : AbstractValidator<CreateWarehouseRequest>
{
    public CreateWarehouseValidator(IWarehouseRepository warehouseRepository)
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .MaximumLength(50)
            .MustAsync(async (code, _) => !await warehouseRepository.ExistsByCodeAsync(code))
            .WithMessage("رمز المستودع موجود مسبقاً");

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.Location)
            .MaximumLength(500);
    }
}
