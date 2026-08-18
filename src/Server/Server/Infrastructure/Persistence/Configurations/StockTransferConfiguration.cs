using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Inventory;
using Server.Features.Inventory.Entities;
using Server.Features.Inventory.Enums;

namespace Server.Infrastructure.Persistence.Configurations;

public class StockTransferConfiguration : IEntityTypeConfiguration<StockTransfer>
{
    public void Configure(EntityTypeBuilder<StockTransfer> builder)
    {
        builder.ToTable("StockTransfers");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TransferNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.TransferNumber).IsUnique();

        builder.Property(e => e.Quantity).HasPrecision(12, 3).IsRequired();
        builder.Property(e => e.Notes).HasMaxLength(1000);

        builder.Property(e => e.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(StockTransferStatus.Draft);

        // Relationships
        builder.HasOne(e => e.FromWarehouse)
            .WithMany()
            .HasForeignKey(e => e.FromWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.ToWarehouse)
            .WithMany()
            .HasForeignKey(e => e.ToWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Product)
            .WithMany()
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.ApprovedByUser)
            .WithMany()
            .HasForeignKey(e => e.ApprovedBy)
            .OnDelete(DeleteBehavior.SetNull);

        // Soft delete + Concurrency
        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();

        // Indexes
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.FromWarehouseId);
        builder.HasIndex(e => e.ToWarehouseId);
        builder.HasIndex(e => e.ProductId);
        builder.HasIndex(e => e.CreatedAt);
    }
}
