using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;

namespace Server.Infrastructure.Persistence.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("purchase_orders");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.PoNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.PoNumber).IsUnique();

        builder.Property(e => e.TotalAmount).HasPrecision(15, 2);
        builder.Property(e => e.Currency).HasMaxLength(10).HasDefaultValue("SAR");
        builder.Property(e => e.Terms).HasMaxLength(2000);

        builder.Property(e => e.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(PurchaseOrderStatus.Draft);

        builder.HasOne(e => e.Supplier)
            .WithMany(s => s.PurchaseOrders)
            .HasForeignKey(e => e.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.SupplierId);
        builder.HasIndex(e => e.OrderDate);
        builder.HasIndex(e => e.Status);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
