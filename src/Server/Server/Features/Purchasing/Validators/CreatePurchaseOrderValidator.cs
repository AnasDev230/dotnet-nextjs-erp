using FluentValidation;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Validators;

public class CreatePurchaseOrderValidator : AbstractValidator<CreatePurchaseOrderRequest>
{
    public CreatePurchaseOrderValidator()
    {
        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("المورد مطلوب");

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
                .NotEmpty().WithMessage("المنتج مطلوب");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("الكمية يجب أن تكون أكبر من صفر");

            item.RuleFor(i => i.UnitPrice)
                .GreaterThan(0).WithMessage("سعر الوحدة يجب أن يكون أكبر من صفر");
        });
    }
}
