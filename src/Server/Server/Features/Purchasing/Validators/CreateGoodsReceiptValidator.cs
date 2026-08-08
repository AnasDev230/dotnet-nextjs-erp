using FluentValidation;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Validators;

public class CreateGoodsReceiptValidator : AbstractValidator<CreateGoodsReceiptRequest>
{
    public CreateGoodsReceiptValidator()
    {
        RuleFor(x => x.PurchaseOrderId)
            .NotEmpty().WithMessage("أمر الشراء مطلوب");

        RuleFor(x => x.ReceiptDate)
            .NotEmpty().WithMessage("تاريخ الاستلام مطلوب")
            .Must(date => date <= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("لا يمكن أن يكون تاريخ الاستلام في المستقبل");

        RuleFor(x => x.WarehouseId)
            .NotEmpty().WithMessage("المستودع مطلوب");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("الملاحظات يجب ألا تتجاوز 1000 حرفاً");

        RuleFor(x => x.Items)
            .Must(items => items.Any()).WithMessage("يجب إضافة عنصر استلام واحد على الأقل")
            .Must(items => items.Select(i => i.PoItemId).Distinct().Count() == items.Count)
            .WithMessage("لا يمكن تكرار نفس سطر أمر الشراء في نفس الاستلام");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.PoItemId)
                .NotEmpty().WithMessage("سطر أمر الشراء مطلوب");

            item.RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("المنتج مطلوب");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("الكمية يجب أن تكون أكبر من صفر");
        });
    }
}