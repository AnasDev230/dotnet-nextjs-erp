using FluentValidation;
using Server.Features.Settings.Models;

namespace Server.Features.Settings.Validators;

public class UpdateCompanySettingsValidator : AbstractValidator<UpdateCompanySettingsRequest>
{
    public UpdateCompanySettingsValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("اسم الشركة مطلوب")
            .MaximumLength(200).WithMessage("اسم الشركة يجب ألا يتجاوز 200 حرفاً");

        RuleFor(x => x.CompanyNameEn)
            .MaximumLength(200).WithMessage("اسم الشركة بالإنجليزية يجب ألا يتجاوز 200 حرفاً");

        RuleFor(x => x.TaxNumber)
            .MaximumLength(50).WithMessage("الرقم الضريبي يجب ألا يتجاوز 50 حرفاً");

        RuleFor(x => x.Phone)
            .MaximumLength(50).WithMessage("رقم الهاتف يجب ألا يتجاوز 50 حرفاً");

        RuleFor(x => x.Email)
            .MaximumLength(200).WithMessage("البريد الإلكتروني يجب ألا يتجاوز 200 حرفاً")
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("صيغة البريد الإلكتروني غير صحيحة");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("العنوان يجب ألا يتجاوز 500 حرفاً");

        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage("المدينة يجب ألا تتجاوز 100 حرفاً");

        RuleFor(x => x.Country)
            .MaximumLength(100).WithMessage("الدولة يجب ألا تتجاوز 100 حرفاً");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("العملة مطلوبة")
            .MaximumLength(10).WithMessage("العملة يجب ألا تتجاوز 10 أحرف");
    }
}