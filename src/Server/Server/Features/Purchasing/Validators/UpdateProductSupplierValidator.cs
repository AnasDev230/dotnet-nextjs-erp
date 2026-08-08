using FluentValidation;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Validators;

public class UpdateProductSupplierValidator : AbstractValidator<UpdateProductSupplierRequest>
{
    public UpdateProductSupplierValidator()
    {
        RuleFor(x => x.LeadTimeDays)
            .GreaterThanOrEqualTo(0).WithMessage("مدة التسليم يجب ألا تكون سالبة");

        RuleFor(x => x.MinOrderQty)
            .GreaterThanOrEqualTo(0).WithMessage("الحد الأدنى للكمية يجب ألا يكون سالباً");

        RuleFor(x => x.UnitCost)
            .GreaterThan(0).WithMessage("تكلفة الوحدة يجب أن تكون أكبر من صفر");

        RuleFor(x => x.SupplierSku)
            .MaximumLength(100).WithMessage("رمز المورد للصنف يجب ألا يتجاوز 100 حرفاً");
    }
}