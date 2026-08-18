using FluentValidation;
using Server.Features.Inventory.Models;
using Server.Features.Inventory.Repositories;

namespace Server.Features.Inventory.Validators;

public class UpdateStockTransferValidator : AbstractValidator<UpdateStockTransferRequest>
{
    public UpdateStockTransferValidator(
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository)
    {
        RuleFor(x => x.FromWarehouseId)
            .NotEmpty()
            .MustAsync(async (id, _) => await warehouseRepository.ExistsByIdAsync(id))
            .WithMessage("From warehouse does not exist.");

        RuleFor(x => x.ToWarehouseId)
            .NotEmpty()
            .MustAsync(async (id, _) => await warehouseRepository.ExistsByIdAsync(id))
            .WithMessage("To warehouse does not exist.");

        RuleFor(x => x)
            .Must(x => x.FromWarehouseId != x.ToWarehouseId)
            .WithMessage("Source and destination warehouses cannot be the same.");

        RuleFor(x => x.ProductId)
            .NotEmpty()
            .MustAsync(async (id, _) => await productRepository.ExistsAsync(id))
            .WithMessage("Product does not exist.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0);

        RuleFor(x => x.Notes)
            .MaximumLength(1000);
    }
}
