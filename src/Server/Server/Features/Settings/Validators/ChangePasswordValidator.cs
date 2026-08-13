using FluentValidation;
using Server.Features.Settings.Models;

namespace Server.Features.Settings.Validators;

public class ChangePasswordValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("كلمة المرور الحالية مطلوبة");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("كلمة المرور الجديدة مطلوبة")
            .MinimumLength(8).WithMessage("كلمة المرور يجب ألا تقل عن 8 أحرف")
            .Matches("[A-Z]").WithMessage("كلمة المرور يجب أن تحتوي على حرف كبير")
            .Matches("[a-z]").WithMessage("كلمة المرور يجب أن تحتوي على حرف صغير")
            .Matches("[0-9]").WithMessage("كلمة المرور يجب أن تحتوي على رقم")
            .NotEqual(x => x.CurrentPassword).WithMessage("كلمة المرور الجديدة يجب أن تختلف عن الحالية");

        RuleFor(x => x.ConfirmNewPassword)
            .NotEmpty().WithMessage("تأكيد كلمة المرور مطلوب")
            .Equal(x => x.NewPassword).WithMessage("كلمتا المرور غير متطابقتين");
    }
}