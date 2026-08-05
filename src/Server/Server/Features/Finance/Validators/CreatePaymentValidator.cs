using FluentValidation;
using Server.Features.Finance.Models;

namespace Server.Features.Finance.Validators;

public class CreatePaymentValidator : AbstractValidator<CreatePaymentRequest>
{
    public CreatePaymentValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("المبلغ يجب أن يكون أكبر من صفر");

        RuleFor(x => x.PaymentDate)
            .NotEmpty().WithMessage("تاريخ الدفع مطلوب");

        RuleFor(x => x.Reference)
            .MaximumLength(100).WithMessage("المرجع يجب ألا يتجاوز 100 حرف");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("الملاحظات يجب ألا تتجاوز 500 حرف");
    }
}
