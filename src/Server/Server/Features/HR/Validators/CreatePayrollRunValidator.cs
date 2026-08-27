using FluentValidation;
using Server.Features.HR.Models;

namespace Server.Features.HR.Validators;

public class CreatePayrollRunValidator : AbstractValidator<CreatePayrollRunRequest>
{
    public CreatePayrollRunValidator()
    {
        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12).WithMessage("الشهر يجب أن يكون بين 1 و 12.");

        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100).WithMessage("السنة غير صحيحة.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("الملاحظات يجب ألا تتجاوز 1000 حرف.");
    }
}
