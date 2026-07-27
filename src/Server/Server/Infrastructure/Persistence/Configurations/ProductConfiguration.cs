using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Inventory;

namespace Server.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Sku)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(e => e.Sku)
            .IsUnique();

        builder.Property(e => e.Name)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnType("nvarchar(max)");

        builder.Property(e => e.UnitOfMeasure)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(e => e.ReorderLevel)
            .HasPrecision(12, 3)
            .HasDefaultValue(0);

        builder.Property(e => e.ReorderQty)
            .HasPrecision(12, 3)
            .HasDefaultValue(0);

        builder.Property(e => e.SalePrice)
            .HasPrecision(15, 2)
            .HasDefaultValue(0);

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true);

        builder.HasOne(e => e.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.CategoryId);
        builder.HasIndex(e => e.IsActive);
    }
}
