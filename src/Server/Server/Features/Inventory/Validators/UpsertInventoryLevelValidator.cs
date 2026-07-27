using FluentValidation;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;

namespace Server.Features.Inventory.Validators;

public class UpsertInventoryLevelValidator : AbstractValidator<UpsertInventoryLevelRequest>
{
    public UpsertInventoryLevelValidator(
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

        RuleFor(x => x.QuantityOnHand)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.AvgCost)
            .GreaterThanOrEqualTo(0);
    }
}
