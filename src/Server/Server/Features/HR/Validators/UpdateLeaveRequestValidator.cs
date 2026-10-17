using FluentValidation;
using Server.Features.HR.Models;

namespace Server.Features.HR.Validators;

public class UpdateLeaveRequestValidator : AbstractValidator<UpdateLeaveRequestRequest>
{
    public UpdateLeaveRequestValidator()
    {
        RuleFor(x => x.LeaveType)
            .IsInEnum().WithMessage("نوع الإجازة غير صحيح.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("تاريخ البداية مطلوب.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("تاريخ النهاية مطلوب.")
            .Must((request, endDate) => endDate.Date >= request.StartDate.Date)
            .WithMessage("تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساوياً له.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("سبب الإجازة مطلوب.")
            .MaximumLength(500).WithMessage("سبب الإجازة يجب ألا يتجاوز 500 حرف.");
    }
}
