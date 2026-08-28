using FluentValidation;
using Server.Features.Inventory.Models;

namespace Server.Features.Inventory.Validators;

public class CreateStockAdjustmentValidator : AbstractValidator<CreateStockAdjustmentRequest>
{
    public CreateStockAdjustmentValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty();

        RuleFor(x => x.WarehouseId)
            .NotEmpty();

        RuleFor(x => x.CountedQty)
            .GreaterThanOrEqualTo(0).WithMessage("الكمية المعدودة لا يمكن أن تكون سالبة")
            .LessThanOrEqualTo(999_999).WithMessage("الكمية المعدودة تتجاوز الحد الأقصى المسموح");

        RuleFor(x => x.Reason)
            .NotEmpty()
            .MaximumLength(500);
    }
}
