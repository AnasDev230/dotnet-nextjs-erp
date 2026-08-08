using FluentValidation;
using Server.Features.HR.Models;
using Server.Features.HR.Repositories;

namespace Server.Features.HR.Validators;

public class CreateEmployeeValidator : AbstractValidator<CreateEmployeeRequest>
{
    public CreateEmployeeValidator(IEmployeeRepository repository)
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
                .MaximumLength(200).WithMessage("البريد الإلكتروني يجب ألا يتجاوز 200 حرفاً")
                .MustAsync(async (email, _) => !await repository.IsEmailAsync(email!))
                .WithMessage("البريد الإلكتروني مستخدم من قبل موظف آخر");
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

        When(x => x.DepartmentId.HasValue, () =>
        {
            RuleFor(x => x.DepartmentId)
                .MustAsync(async (departmentId, _) => await repository.DepartmentIdExistsAsync(departmentId!.Value))
                .WithMessage("القسم المحدد غير موجود");
        });

        When(x => x.ManagerId.HasValue, () =>
        {
            RuleFor(x => x.ManagerId)
                .MustAsync(async (managerId, _) => await repository.ExistsByIdAsync(managerId!.Value))
                .WithMessage("المدير المحدد غير موجود");
        });

        When(x => x.UserId.HasValue, () =>
        {
            RuleFor(x => x.UserId)
                .MustAsync(async (userId, _) => await repository.UserIdExistsAsync(userId!.Value))
                .WithMessage("حساب المستخدم المحدد غير موجود")
                .MustAsync(async (userId, _) => !await repository.IsUserIdLinkedAsync(userId!.Value))
                .WithMessage("حساب المستخدم مرتبط بموظف آخر");
        });

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("الملاحظات يجب ألا تتجاوز 1000 حرفاً");
    }
}