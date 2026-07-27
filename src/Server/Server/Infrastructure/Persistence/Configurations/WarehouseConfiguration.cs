using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Inventory;

namespace Server.Infrastructure.Persistence.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(e => e.Code)
            .IsUnique();

        builder.Property(e => e.Name)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.Location)
            .HasMaxLength(500);

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true);
    }
}
