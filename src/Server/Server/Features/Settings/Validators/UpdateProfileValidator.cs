using FluentValidation;
using Server.Features.Settings.Models;

namespace Server.Features.Settings.Validators;

public class UpdateProfileValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("الاسم الكامل مطلوب")
            .MaximumLength(200).WithMessage("الاسم الكامل يجب ألا يتجاوز 200 حرفاً");
    }
}