using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class GoodsReceiptItemConfiguration : IEntityTypeConfiguration<GoodsReceiptItem>
{
    public void Configure(EntityTypeBuilder<GoodsReceiptItem> builder)
    {
        builder.ToTable("goods_receipt_items");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Quantity).HasPrecision(12, 3);

        builder.HasOne(e => e.GoodsReceipt)
            .WithMany(gr => gr.Items)
            .HasForeignKey(e => e.GoodsReceiptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.PoItem)
            .WithMany(pi => pi.GoodsReceiptItems)
            .HasForeignKey(e => e.PoItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Product)
            .WithMany()
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.GoodsReceiptId);
        builder.HasIndex(e => e.PoItemId);
        builder.HasIndex(e => e.ProductId);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
