using FluentValidation;
using Server.Features.HR.Models;

namespace Server.Features.HR.Validators;

public class UpdateAttendanceValidator : AbstractValidator<UpdateAttendanceRequest>
{
    public UpdateAttendanceValidator()
    {
        RuleFor(x => x.BreakMinutes)
            .GreaterThanOrEqualTo(0).WithMessage("دقائق الاستراحة يجب أن تكون أكبر من أو تساوي صفر.")
            .LessThanOrEqualTo(480).WithMessage("دقائق الاستراحة كبيرة جداً.");

        RuleFor(x => x.CheckOut)
            .Must((req, checkOut) =>
            {
                if (!req.CheckIn.HasValue || !checkOut.HasValue) return true;
                return checkOut.Value > req.CheckIn.Value;
            })
            .WithMessage("وقت الخروج يجب أن يكون بعد وقت الدخول.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("حالة الحضور غير صحيحة.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("الملاحظات يجب ألا تتجاوز 500 حرف.");
    }
}
