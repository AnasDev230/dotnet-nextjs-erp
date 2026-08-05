using FluentValidation;
using Server.Features.Finance.Models;
using Server.Features.Finance.Repositories;
using Server.Features.Sales.Repositories;

namespace Server.Features.Finance.Validators;

public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceRequest>
{
    public CreateInvoiceValidator(
        ISalesOrderRepository salesOrderRepository,
        IInvoiceRepository invoiceRepository)
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("أمر البيع مطلوب")
            .MustAsync(async (orderId, _) =>
                await salesOrderRepository.GetByIdAsync(orderId) != null)
            .WithMessage("أمر البيع غير موجود");

        RuleFor(x => x.OrderId)
            .MustAsync(async (orderId, _) =>
                await invoiceRepository.GetByOrderIdAsync(orderId) == null)
            .WithMessage("يوجد فاتورة بالفعل لهذا الأمر");

        RuleFor(x => x.IssueDate)
            .NotEmpty().WithMessage("تاريخ الإصدار مطلوب");
    }
}
