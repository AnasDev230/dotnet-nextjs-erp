using FluentValidation;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Validators;

public class CreateSupplierValidator : AbstractValidator<CreateSupplierRequest>
{
    public CreateSupplierValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("اسم المورد مطلوب")
            .MaximumLength(200).WithMessage("اسم المورد يجب ألا يتجاوز 200 حرف");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("بريد إلكتروني غير صالح")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.PaymentTerms)
            .GreaterThanOrEqualTo(0).WithMessage("شروط الدفع يجب أن تكون 0 أو أكثر");

        RuleFor(x => x.Rating)
            .InclusiveBetween(0, 5).WithMessage("التقييم يجب أن يكون بين 0 و 5");
    }
}
