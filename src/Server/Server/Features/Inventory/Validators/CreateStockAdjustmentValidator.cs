using FluentValidation;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;

namespace Server.Features.Inventory.Validators;

public class CreateStockAdjustmentValidator : AbstractValidator<CreateStockAdjustmentRequest>
{
    public CreateStockAdjustmentValidator(
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository)
    {
        RuleFor(x => x.ProductId)
            .NotEmpty()
            .MustAsync(async (id, _) => await productRepository.ExistsAsync(id))
            .WithMessage("Product does not exist.");

        RuleFor(x => x.WarehouseId)
            .NotEmpty()
            .MustAsync(async (id, _) => await warehouseRepository.ExistsByIdAsync(id))
            .WithMessage("Warehouse does not exist.");

        RuleFor(x => x.CountedQty)
            .GreaterThanOrEqualTo(0).WithMessage("الكمية المعدودة لا يمكن أن تكون سالبة")
            .LessThanOrEqualTo(999_999).WithMessage("الكمية المعدودة تتجاوز الحد الأقصى المسموح");

        RuleFor(x => x.Reason)
            .NotEmpty()
            .MaximumLength(500);
    }
}
