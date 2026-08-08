using FluentValidation;
using Server.Features.HR.Models;
using Server.Features.HR.Repositories;

namespace Server.Features.HR.Validators;

public class CreateDepartmentValidator : AbstractValidator<CreateDepartmentRequest>
{
    public CreateDepartmentValidator(IDepartmentRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("اسم القسم مطلوب")
            .MaximumLength(200).WithMessage("الاسم يجب ألا يتجاوز 200 حرفاً")
            .MustAsync(async (name, _) => !await repository.IsNameUniqueAsync(name))
            .WithMessage("اسم القسم موجود مسبقاً");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("الوصف يجب ألا يتجاوز 500 حرفاً");
    }
}