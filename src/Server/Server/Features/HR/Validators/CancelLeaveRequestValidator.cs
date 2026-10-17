using FluentValidation;
using Server.Features.HR.Models;

namespace Server.Features.HR.Validators;

public class CancelLeaveRequestValidator : AbstractValidator<CancelLeaveRequestRequest>
{
    public CancelLeaveRequestValidator()
    {
        RuleFor(x => x.DecisionNote)
            .MaximumLength(500).WithMessage("ملاحظة الإلغاء يجب ألا تتجاوز 500 حرف.");
    }
}
