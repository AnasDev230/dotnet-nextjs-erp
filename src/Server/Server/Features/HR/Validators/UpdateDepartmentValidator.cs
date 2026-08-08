using FluentValidation;
using Server.Features.HR.Models;

namespace Server.Features.HR.Validators;

public class UpdateDepartmentValidator : AbstractValidator<UpdateDepartmentRequest>
{
    public UpdateDepartmentValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("اسم القسم مطلوب")
            .MaximumLength(200).WithMessage("الاسم يجب ألا يتجاوز 200 حرفاً");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("الوصف يجب ألا يتجاوز 500 حرفاً");
    }
}