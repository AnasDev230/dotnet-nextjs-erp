using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;

namespace Server.Infrastructure.Persistence.Configurations;

public class GoodsReceiptConfiguration : IEntityTypeConfiguration<GoodsReceipt>
{
    public void Configure(EntityTypeBuilder<GoodsReceipt> builder)
    {
        builder.ToTable("goods_receipts");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.GrnNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.GrnNumber).IsUnique();

        builder.Property(e => e.Notes).HasMaxLength(1000);

        builder.Property(e => e.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(GoodsReceiptStatus.Received);

        builder.HasOne(e => e.PurchaseOrder)
            .WithMany(po => po.GoodsReceipts)
            .HasForeignKey(e => e.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Warehouse)
            .WithMany()
            .HasForeignKey(e => e.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.PurchaseOrderId);
        builder.HasIndex(e => e.WarehouseId);
        builder.HasIndex(e => e.ReceiptDate);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
