using FluentValidation;
using Server.Features.HR.Models;

namespace Server.Features.HR.Validators;

public class RejectLeaveRequestValidator : AbstractValidator<RejectLeaveRequestRequest>
{
    public RejectLeaveRequestValidator()
    {
        RuleFor(x => x.DecisionNote)
            .NotEmpty().WithMessage("سبب الرفض مطلوب.")
            .MaximumLength(500).WithMessage("سبب الرفض يجب ألا يتجاوز 500 حرف.");
    }
}
