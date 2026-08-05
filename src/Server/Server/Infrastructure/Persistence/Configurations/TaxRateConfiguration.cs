using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Sales;

namespace Server.Infrastructure.Persistence.Configurations;

public class TaxRateConfiguration : IEntityTypeConfiguration<TaxRate>
{
    public void Configure(EntityTypeBuilder<TaxRate> builder)
    {
        builder.ToTable("tax_rates");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.Rate)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(t => t.IsActive)
            .HasDefaultValue(true);

        builder.HasIndex(t => t.Name);
    }
}
