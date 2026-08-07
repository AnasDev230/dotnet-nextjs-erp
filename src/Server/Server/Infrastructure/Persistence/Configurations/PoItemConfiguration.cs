using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class PoItemConfiguration : IEntityTypeConfiguration<PoItem>
{
    public void Configure(EntityTypeBuilder<PoItem> builder)
    {
        builder.ToTable("po_items");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Quantity).HasPrecision(12, 3);
        builder.Property(e => e.ReceivedQty).HasPrecision(12, 3).HasDefaultValue(0);
        builder.Property(e => e.UnitPrice).HasPrecision(15, 4);
        builder.Property(e => e.LineTotal).HasPrecision(15, 2);

        builder.HasOne(e => e.PurchaseOrder)
            .WithMany(po => po.Items)
            .HasForeignKey(e => e.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Product)
            .WithMany()
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.PurchaseOrderId);
        builder.HasIndex(e => e.ProductId);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
