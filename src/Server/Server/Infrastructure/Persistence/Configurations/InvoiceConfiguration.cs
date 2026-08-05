using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Finance;
using Server.Features.Finance.Enums;
using Server.Features.Sales;

namespace Server.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.InvoiceNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(e => e.InvoiceNumber)
            .IsUnique();

        builder.Property(e => e.OrderId)
            .IsRequired();

        // One-to-One with sales_orders
        builder.HasIndex(e => e.OrderId)
            .IsUnique();

        builder.Property(e => e.CustomerId)
            .IsRequired();

        builder.Property(e => e.IssueDate)
            .IsRequired();

        builder.Property(e => e.DueDate);

        // tinyint in DB, enum in C#
        builder.Property(e => e.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(InvoiceStatus.Draft);

        builder.Property(e => e.Subtotal)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(e => e.DiscountAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(e => e.TaxAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(e => e.NetAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(e => e.PaidAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.HasOne(e => e.SalesOrder)
            .WithOne(o => o.Invoice)
            .HasForeignKey<Invoice>(e => e.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Customer)
            .WithMany()
            .HasForeignKey(e => e.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Payments)
            .WithOne(p => p.Invoice)
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.CustomerId);
        builder.HasIndex(e => e.IssueDate);
        builder.HasIndex(e => e.Status);

        // Soft delete filter
        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
