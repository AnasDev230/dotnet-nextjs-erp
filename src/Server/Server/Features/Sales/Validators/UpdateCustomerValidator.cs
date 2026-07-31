using FluentValidation;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Validators;

public class UpdateCustomerValidator : AbstractValidator<UpdateCustomerRequest>
{
    public UpdateCustomerValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("اسم العميل مطلوب")
            .MaximumLength(255).WithMessage("الاسم يجب ألا يتجاوز 255 حرفاً");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("نوع العميل غير صحيح");

        RuleFor(x => x.TaxNumber)
            .MaximumLength(50).WithMessage("الرقم الضريبي يجب ألا يتجاوز 50 حرفاً");

        RuleFor(x => x.CreditLimit)
            .GreaterThanOrEqualTo(0).WithMessage("حد الائتمان يجب أن يكون 0 أو أكثر");

        RuleFor(x => x.PaymentTerms)
            .GreaterThanOrEqualTo(0).WithMessage("شروط الدفع يجب أن تكون 0 أو أكثر");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("حالة العميل غير صحيحة");
    }
}
