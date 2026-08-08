using FluentValidation;
using Server.Features.HR.Models;

namespace Server.Features.HR.Validators;

public class UpdateEmployeeValidator : AbstractValidator<UpdateEmployeeRequest>
{
    public UpdateEmployeeValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("الاسم الأول مطلوب")
            .MaximumLength(100).WithMessage("الاسم الأول يجب ألا يتجاوز 100 حرفاً");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("اسم العائلة مطلوب")
            .MaximumLength(100).WithMessage("اسم العائلة يجب ألا يتجاوز 100 حرفاً");

        When(x => !string.IsNullOrWhiteSpace(x.Email), () =>
        {
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("صيغة البريد الإلكتروني غير صحيحة")
                .MaximumLength(200).WithMessage("البريد الإلكتروني يجب ألا يتجاوز 200 حرفاً");
        });

        RuleFor(x => x.Phone)
            .MaximumLength(50).WithMessage("رقم الهاتف يجب ألا يتجاوز 50 حرفاً");

        RuleFor(x => x.HireDate)
            .NotEmpty().WithMessage("تاريخ التعيين مطلوب")
            .Must(d => d <= DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("تاريخ التعيين لا يمكن أن يكون في المستقبل");

        RuleFor(x => x.JobTitle)
            .MaximumLength(200).WithMessage("المسمى الوظيفي يجب ألا يتجاوز 200 حرفاً");

        RuleFor(x => x.EmploymentType)
            .IsInEnum().WithMessage("نوع التوظيف غير صحيح");

        RuleFor(x => x.Salary)
            .GreaterThanOrEqualTo(0).WithMessage("الراتب يجب أن يكون 0 أو أكثر");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("حالة الموظف غير صحيحة");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("الملاحظات يجب ألا تتجاوز 1000 حرفاً");
    }
}