using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Inventory;

namespace Server.Infrastructure.Persistence.Configurations;

public class StockAdjustmentConfiguration : IEntityTypeConfiguration<StockAdjustment>
{
    public void Configure(EntityTypeBuilder<StockAdjustment> builder)
    {
        builder.ToTable("StockAdjustments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.CountedQty)
            .HasPrecision(12, 3)
            .IsRequired();

        builder.Property(e => e.SystemQty)
            .HasPrecision(12, 3)
            .IsRequired();

        builder.Property(e => e.Reason)
            .HasMaxLength(500)
            .IsRequired();

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
        builder.HasIndex(e => e.CreatedAt);
    }
}
