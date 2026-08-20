using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class PurchaseReturnItemConfiguration : IEntityTypeConfiguration<PurchaseReturnItem>
{
    public void Configure(EntityTypeBuilder<PurchaseReturnItem> builder)
    {
        builder.ToTable("purchase_return_items");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Quantity)
            .HasPrecision(12, 3);

        builder.Property(e => e.UnitCost)
            .HasPrecision(15, 2);

        builder.Property(e => e.LineTotal)
            .HasPrecision(15, 2);

        builder.Property(e => e.Reason)
            .HasMaxLength(500);

        builder.HasOne(e => e.PurchaseReturn)
            .WithMany(r => r.Items)
            .HasForeignKey(e => e.PurchaseReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Product)
            .WithMany()
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.PurchaseReturnId);
        builder.HasIndex(e => e.ProductId);

        // Prevent duplicate products in the same return
        builder.HasIndex(e => new { e.PurchaseReturnId, e.ProductId })
            .IsUnique();

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}