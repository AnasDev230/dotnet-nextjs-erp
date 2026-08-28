using FluentValidation;
using Server.Features.Finance.Models;

namespace Server.Features.Finance.Validators;

public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceRequest>
{
    public CreateInvoiceValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("أمر البيع مطلوب");

        RuleFor(x => x.IssueDate)
            .NotEmpty().WithMessage("تاريخ الإصدار مطلوب");
    }
}
