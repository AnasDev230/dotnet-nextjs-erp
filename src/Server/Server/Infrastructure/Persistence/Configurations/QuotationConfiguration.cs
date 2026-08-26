using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Sales.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class QuotationConfiguration : IEntityTypeConfiguration<Quotation>
{
    public void Configure(EntityTypeBuilder<Quotation> builder)
    {
        builder.ToTable("quotations");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.QuotationNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(e => e.QuotationNumber)
            .IsUnique();

        builder.Property(e => e.Subtotal)
            .HasPrecision(15, 2)
            .IsRequired();

        builder.Property(e => e.DiscountAmount)
            .HasPrecision(15, 2)
            .IsRequired();

        builder.Property(e => e.TaxAmount)
            .HasPrecision(15, 2)
            .IsRequired();

        builder.Property(e => e.NetAmount)
            .HasPrecision(15, 2)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasConversion<byte>()
            .IsRequired();

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.HasOne(e => e.Customer)
            .WithMany()
            .HasForeignKey(e => e.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.ConvertedSalesOrder)
            .WithMany()
            .HasForeignKey(e => e.ConvertedSalesOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();

        builder.HasIndex(e => e.CustomerId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.QuotationDate);
        builder.HasIndex(e => e.ExpiryDate);
    }
}
