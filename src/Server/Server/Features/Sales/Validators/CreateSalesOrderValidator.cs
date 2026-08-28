using FluentValidation;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Validators;

public class CreateSalesOrderValidator : AbstractValidator<CreateSalesOrderRequest>
{
    public CreateSalesOrderValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("العميل مطلوب");

        RuleFor(x => x.WarehouseId)
            .NotEmpty().WithMessage("المستودع مطلوب");

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

        RuleFor(x => x.DiscountPct)
            .InclusiveBetween(0, 100).WithMessage("نسبة الخصم يجب أن تكون بين 0 و 100");

        RuleFor(x => x.Items)
            .Must(items => items.Any()).WithMessage("يجب إضافة منتج واحد على الأقل")
            .Must(items => items.Select(i => i.ProductId).Distinct().Count() == items.Count)
            .WithMessage("لا يمكن تكرار نفس المنتج في نفس الأمر");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("المنتج مطلوب");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("الكمية يجب أن تكون أكبر من صفر");

            item.RuleFor(i => i.UnitPrice)
                .GreaterThanOrEqualTo(0).WithMessage("سعر الوحدة يجب أن يكون 0 أو أكثر");

            item.RuleFor(i => i.DiscountPct)
                .InclusiveBetween(0, 100).WithMessage("نسبة خصم السطر يجب أن تكون بين 0 و 100");
        });
    }
}
