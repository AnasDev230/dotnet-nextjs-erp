using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class ProductSupplierConfiguration : IEntityTypeConfiguration<ProductSupplier>
{
    public void Configure(EntityTypeBuilder<ProductSupplier> builder)
    {
        builder.ToTable("product_suppliers");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.SupplierSku).HasMaxLength(100);
        builder.Property(e => e.MinOrderQty).HasPrecision(12, 3);
        builder.Property(e => e.UnitCost).HasPrecision(15, 4);

        builder.HasOne(e => e.Product)
            .WithMany()
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Supplier)
            .WithMany(s => s.ProductSuppliers)
            .HasForeignKey(e => e.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.ProductId, e.SupplierId }).IsUnique();
        builder.HasIndex(e => e.ProductId);
        builder.HasIndex(e => e.SupplierId);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
