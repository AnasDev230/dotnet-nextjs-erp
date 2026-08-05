using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Sales;

namespace Server.Infrastructure.Persistence.Configurations;

public class SalesOrderConfiguration : IEntityTypeConfiguration<SalesOrder>
{
    public void Configure(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.ToTable("sales_orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.Property(o => o.CustomerId)
            .IsRequired();

        builder.Property(o => o.OrderDate)
            .IsRequired();

        builder.Property(o => o.DeliveryDate);

        // tinyint in DB, enum in C#
        builder.Property(o => o.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(SalesOrderStatus.Draft);

        builder.Property(o => o.TotalAmount)
            .HasPrecision(15, 2);

        builder.Property(o => o.DiscountPct)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(o => o.DiscountAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(o => o.TaxPct)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(o => o.TaxAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(o => o.NetAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(o => o.Notes)
            .HasMaxLength(2000);

        builder.HasOne(o => o.Customer)
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.TaxRate)
            .WithMany()
            .HasForeignKey(o => o.TaxRateId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(o => o.CustomerId);
        builder.HasIndex(o => o.TaxRateId);
        builder.HasIndex(o => o.OrderDate);
        builder.HasIndex(o => o.Status);

        // Soft delete filter
        builder.HasQueryFilter(o => o.DeletedAt == null);
    }
}
