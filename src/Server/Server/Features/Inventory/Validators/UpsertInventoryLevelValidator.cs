using FluentValidation;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Validators;

public class UpsertInventoryLevelValidator : AbstractValidator<UpsertInventoryLevelRequest>
{
    public UpsertInventoryLevelValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty();

        RuleFor(x => x.WarehouseId)
            .NotEmpty();

        RuleFor(x => x.QuantityOnHand)
            .GreaterThanOrEqualTo(0).WithMessage("الكمية لا يمكن أن تكون سالبة")
            .LessThanOrEqualTo(999_999).WithMessage("الكمية تتجاوز الحد الأقصى المسموح");

        RuleFor(x => x.AvgCost)
            .GreaterThanOrEqualTo(0).WithMessage("التكلفة لا يمكن أن تكون سالبة");
    }
}
