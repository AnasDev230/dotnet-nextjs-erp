using FluentValidation;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;

namespace Server.Features.Purchasing.Validators;

public class CreateSupplierValidator : AbstractValidator<CreateSupplierRequest>
{
    public CreateSupplierValidator(ISupplierRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("اسم المورد مطلوب")
            .MaximumLength(200).WithMessage("اسم المورد يجب ألا يتجاوز 200 حرف")
            .MustAsync(async (name, _) => !await repository.IsNameUniqueAsync(name))
            .WithMessage("اسم المورد موجود بالفعل");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("بريد إلكتروني غير صالح")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.PaymentTerms)
            .GreaterThanOrEqualTo(0).WithMessage("شروط الدفع يجب أن تكون 0 أو أكثر");

        RuleFor(x => x.Rating)
            .InclusiveBetween(0, 5).WithMessage("التقييم يجب أن يكون بين 0 و 5");
    }
}
