using FluentValidation;
using Server.Features.HR.Models;

namespace Server.Features.HR.Validators;

public class BulkAttendanceValidator : AbstractValidator<BulkAttendanceRequest>
{
    public BulkAttendanceValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("التاريخ مطلوب.")
            .Must(d => d.Date <= DateTime.Today)
            .WithMessage("لا يمكن تسجيل حضور لتاريخ مستقبلي.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("يجب إدخال موظف واحد على الأقل.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.EmployeeId)
                .NotEmpty().WithMessage("الموظف مطلوب.");

            item.RuleFor(i => i.Status)
                .IsInEnum().WithMessage("حالة الحضور غير صحيحة.");

            item.RuleFor(i => i.Notes)
                .MaximumLength(500).WithMessage("الملاحظات يجب ألا تتجاوز 500 حرف.");

            item.RuleFor(i => i.CheckOut)
                .Must((req, checkOut) =>
                {
                    if (!req.CheckIn.HasValue || !checkOut.HasValue) return true;
                    return checkOut.Value > req.CheckIn.Value;
                })
                .WithMessage("وقت الخروج يجب أن يكون بعد وقت الدخول.");
        });
    }
}
