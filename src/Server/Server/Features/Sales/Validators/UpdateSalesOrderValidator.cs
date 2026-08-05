using FluentValidation;
using Server.Features.Inventory.Repositories;
using Server.Features.Sales.Models;
using Server.Features.Sales.Repositories;

namespace Server.Features.Sales.Validators;

public class UpdateSalesOrderValidator : AbstractValidator<UpdateSalesOrderRequest>
{
    public UpdateSalesOrderValidator(
        ICustomerRepository customerRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository,
        ITaxRateRepository taxRateRepository)
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("العميل مطلوب")
            .MustAsync(async (id, _) => await customerRepository.ExistsByIdAsync(id))
            .WithMessage("العميل غير موجود");

        RuleFor(x => x.WarehouseId)
            .NotEmpty().WithMessage("المستودع مطلوب")
            .MustAsync(async (id, _) => await warehouseRepository.ExistsByIdAsync(id))
            .WithMessage("المستودع غير موجود")
            .MustAsync(async (id, _) =>
            {
                var warehouse = await warehouseRepository.GetEntityByIdAsync(id);
                return warehouse is not null && warehouse.IsActive;
            })
            .WithMessage("المستودع غير نشط");

        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("تاريخ الأمر مطلوب")
            .Must(date => date <= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("لا يمكن أن يكون تاريخ الأمر في المستقبل");

        RuleFor(x => x.DeliveryDate)
            .Must((request, deliveryDate) =>
                !deliveryDate.HasValue || deliveryDate.Value >= request.OrderDate)
            .WithMessage("تاريخ التسليم يجب أن يكون في نفس تاريخ الأمر أو بعده");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("الملاحظات يجب ألا تتجاوز 2000 حرفاً");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("حالة الأمر غير صحيحة");

        RuleFor(x => x.DiscountPct)
            .InclusiveBetween(0, 100).WithMessage("نسبة الخصم يجب أن تكون بين 0 و 100");

        RuleFor(x => x.TaxRateId)
            .MustAsync(async (taxRateId, _) =>
                taxRateId == null || await taxRateRepository.ExistsAsync(taxRateId.Value))
            .WithMessage("نسبة الضريبة غير موجودة");

        RuleFor(x => x.Items)
            .Must(items => items.Any()).WithMessage("يجب إضافة منتج واحد على الأقل")
            .Must(items => items.Select(i => i.ProductId).Distinct().Count() == items.Count)
            .WithMessage("لا يمكن تكرار نفس المنتج في نفس الأمر");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("المنتج مطلوب")
                .MustAsync(async (id, _) => await productRepository.ExistsAsync(id))
                .WithMessage("المنتج غير موجود")
                .MustAsync(async (id, _) =>
                {
                    var product = await productRepository.GetByIdAsync(id);
                    return product is not null && product.IsActive;
                })
                .WithMessage("المنتج غير نشط");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("الكمية يجب أن تكون أكبر من صفر");

            item.RuleFor(i => i.UnitPrice)
                .GreaterThanOrEqualTo(0).WithMessage("سعر الوحدة يجب أن يكون 0 أو أكثر");

            item.RuleFor(i => i.DiscountPct)
                .InclusiveBetween(0, 100).WithMessage("نسبة خصم السطر يجب أن تكون بين 0 و 100");
        });
    }
}
