using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Inventory;

namespace Server.Infrastructure.Persistence.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("StockMovements");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.MovementType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.ReferenceType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.ReferenceId)
            .IsRequired();

        builder.Property(e => e.Quantity)
            .HasPrecision(12, 3)
            .IsRequired();

        builder.Property(e => e.UnitCost)
            .HasPrecision(15, 4)
            .HasDefaultValue(0m);

        builder.Property(e => e.TotalCost)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(e => e.MovementDate)
            .IsRequired();

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

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
        builder.HasIndex(e => new { e.ReferenceType, e.ReferenceId });
        builder.HasIndex(e => e.MovementDate);
    }
}
