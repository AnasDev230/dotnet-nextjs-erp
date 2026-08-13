using FluentValidation;
using Server.Core.Constants;
using Server.Features.Settings.Models;

namespace Server.Features.Settings.Validators;

public class UpdateUserValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("الاسم الكامل مطلوب")
            .MaximumLength(200).WithMessage("الاسم الكامل يجب ألا يتجاوز 200 حرفاً");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("الدور مطلوب")
            .Must(role => Roles.AllManagers.Contains(role))
            .WithMessage("الدور المحدد غير صالح");
    }
}