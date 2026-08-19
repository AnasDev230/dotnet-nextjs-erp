using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class PurchasePaymentConfiguration : IEntityTypeConfiguration<PurchasePayment>
{
    public void Configure(EntityTypeBuilder<PurchasePayment> builder)
    {
        builder.ToTable("purchase_payments");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Amount).HasPrecision(15, 2).IsRequired();
        builder.Property(e => e.Method).HasColumnType("tinyint").IsRequired();
        builder.Property(e => e.Reference).HasMaxLength(100);
        builder.Property(e => e.Notes).HasMaxLength(500);

        builder.HasOne(e => e.SupplierInvoice)
            .WithMany(i => i.Payments)
            .HasForeignKey(e => e.SupplierInvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.SupplierInvoiceId);
        builder.HasIndex(e => e.PaymentDate);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}