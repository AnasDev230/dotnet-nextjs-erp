using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Sales;
using Server.Features.Sales.Enums;

namespace Server.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(c => c.Code)
            .IsUnique();

        builder.Property(c => c.Name)
            .HasMaxLength(255)
            .IsRequired();

        // tinyint in DB, enum in C#
        builder.Property(c => c.Type)
            .HasColumnType("tinyint")
            .HasDefaultValue(CustomerType.Individual);

        builder.Property(c => c.TaxNumber)
            .HasMaxLength(50);

        builder.Property(c => c.CreditLimit)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(c => c.PaymentTerms)
            .HasDefaultValue(0);

        // tinyint in DB, enum in C#
        builder.Property(c => c.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(CustomerStatus.Active);

        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.Type);

        // Soft delete filter
        builder.HasQueryFilter(c => c.DeletedAt == null);
    }
}
