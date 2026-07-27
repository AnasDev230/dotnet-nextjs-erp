using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Inventory;

namespace Server.Infrastructure.Persistence.Configurations;

public class InventoryLevelConfiguration : IEntityTypeConfiguration<InventoryLevel>
{
    public void Configure(EntityTypeBuilder<InventoryLevel> builder)
    {
        builder.ToTable("InventoryLevels");

        builder.HasKey(e => e.Id);

        builder.HasIndex(e => new { e.ProductId, e.WarehouseId })
            .IsUnique();

        builder.Property(e => e.QuantityOnHand)
            .HasPrecision(12, 3)
            .HasDefaultValue(0);

        builder.Property(e => e.QuantityReserved)
            .HasPrecision(12, 3)
            .HasDefaultValue(0);

        builder.Property(e => e.AvgCost)
            .HasPrecision(15, 4)
            .HasDefaultValue(0);

        builder.HasOne(e => e.Product)
            .WithMany()
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Warehouse)
            .WithMany()
            .HasForeignKey(e => e.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.ProductId);
        builder.HasIndex(e => e.WarehouseId);
    }
}
