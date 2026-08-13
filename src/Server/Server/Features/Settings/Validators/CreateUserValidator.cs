using FluentValidation;
using Server.Core.Constants;
using Server.Features.Settings.Models;

namespace Server.Features.Settings.Validators;

public class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty().WithMessage("اسم المستخدم مطلوب")
            .MinimumLength(3).WithMessage("اسم المستخدم يجب ألا يقل عن 3 أحرف")
            .MaximumLength(100).WithMessage("اسم المستخدم يجب ألا يتجاوز 100 حرفاً");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("البريد الإلكتروني مطلوب")
            .EmailAddress().WithMessage("صيغة البريد الإلكتروني غير صحيحة")
            .MaximumLength(200).WithMessage("البريد الإلكتروني يجب ألا يتجاوز 200 حرفاً");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("كلمة المرور مطلوبة")
            .MinimumLength(8).WithMessage("كلمة المرور يجب ألا تقل عن 8 أحرف")
            .Matches("[A-Z]").WithMessage("كلمة المرور يجب أن تحتوي على حرف كبير")
            .Matches("[a-z]").WithMessage("كلمة المرور يجب أن تحتوي على حرف صغير")
            .Matches("[0-9]").WithMessage("كلمة المرور يجب أن تحتوي على رقم");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("الاسم الكامل مطلوب")
            .MaximumLength(200).WithMessage("الاسم الكامل يجب ألا يتجاوز 200 حرفاً");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("الدور مطلوب")
            .Must(role => Roles.AllManagers.Contains(role))
            .WithMessage("الدور المحدد غير صالح");
    }
}