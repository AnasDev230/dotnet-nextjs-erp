using FluentValidation;
using Server.Features.Inventory;
using Server.Features.Inventory.Repositories;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;
using Server.Features.Purchasing.Repositories;

namespace Server.Features.Purchasing.Validators;

public class CreateProductSupplierValidator : AbstractValidator<CreateProductSupplierRequest>
{
    public CreateProductSupplierValidator(
        IProductRepository productRepository,
        ISupplierRepository supplierRepository)
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("المنتج مطلوب")
            .MustAsync(async (id, _) =>
            {
                var product = await productRepository.GetEntityByIdAsync(id);
                return product is not null && product.IsActive;
            })
            .WithMessage("المنتج غير موجود أو غير نشط");

        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("المورد مطلوب")
            .MustAsync(async (id, _) =>
            {
                var supplier = await supplierRepository.GetEntityByIdAsync(id);
                return supplier is not null && supplier.Status == SupplierStatus.Active;
            })
            .WithMessage("المورد غير موجود أو غير نشط");

        RuleFor(x => x.LeadTimeDays)
            .GreaterThanOrEqualTo(0).WithMessage("مدة التسليم يجب ألا تكون سالبة");

        RuleFor(x => x.MinOrderQty)
            .GreaterThanOrEqualTo(0).WithMessage("الحد الأدنى للكمية يجب ألا يكون سالباً");

        RuleFor(x => x.UnitCost)
            .GreaterThan(0).WithMessage("تكلفة الوحدة يجب أن تكون أكبر من صفر");

        RuleFor(x => x.SupplierSku)
            .MaximumLength(100).WithMessage("رمز المورد للصنف يجب ألا يتجاوز 100 حرفاً");
    }
}