using FluentValidation;
using Server.Features.Inventory.Repositories;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;

namespace Server.Features.Purchasing.Validators;

public class UpdatePurchaseOrderValidator : AbstractValidator<UpdatePurchaseOrderRequest>
{
    public UpdatePurchaseOrderValidator(
        ISupplierRepository supplierRepository,
        IProductRepository productRepository)
    {
        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("المورد مطلوب")
            .MustAsync(async (id, _) =>
            {
                var supplier = await supplierRepository.GetEntityByIdAsync(id);
                return supplier is not null && supplier.Status == SupplierStatus.Active;
            })
            .WithMessage("المورد غير موجود أو غير نشط");

        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("تاريخ الأمر مطلوب")
            .Must(date => date <= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("لا يمكن أن يكون تاريخ الأمر في المستقبل");

        RuleFor(x => x.ExpectedDate)
            .Must((request, expectedDate) =>
                !expectedDate.HasValue || expectedDate.Value >= request.OrderDate)
            .WithMessage("تاريخ التوقع يجب أن يكون في نفس تاريخ الأمر أو بعده");

        RuleFor(x => x.Items)
            .Must(items => items.Any()).WithMessage("يجب إضافة منتج واحد على الأقل")
            .Must(items => items.Select(i => i.ProductId).Distinct().Count() == items.Count)
            .WithMessage("لا يمكن تكرار نفس المنتج في نفس الأمر");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("المنتج مطلوب")
                .MustAsync(async (id, _) =>
                {
                    var product = await productRepository.GetByIdAsync(id);
                    return product is not null && product.IsActive;
                })
                .WithMessage("المنتج غير موجود أو غير نشط");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("الكمية يجب أن تكون أكبر من صفر");

            item.RuleFor(i => i.UnitPrice)
                .GreaterThan(0).WithMessage("سعر الوحدة يجب أن يكون أكبر من صفر");
        });
    }
}
