using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Finance;

namespace Server.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.InvoiceId)
            .IsRequired();

        builder.Property(e => e.Amount)
            .HasPrecision(15, 2)
            .IsRequired();

        // tinyint in DB, enum in C#
        builder.Property(e => e.PaymentMethod)
            .HasColumnType("tinyint")
            .HasDefaultValue(PaymentMethod.Cash);

        builder.Property(e => e.PaymentDate)
            .IsRequired();

        builder.Property(e => e.Reference)
            .HasMaxLength(100);

        builder.Property(e => e.Notes)
            .HasMaxLength(500);

        builder.HasOne(e => e.Invoice)
            .WithMany(i => i.Payments)
            .HasForeignKey(e => e.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.InvoiceId);
        builder.HasIndex(e => e.PaymentDate);

        // Soft delete filter
        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
