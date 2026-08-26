using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Sales.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class QuotationItemConfiguration : IEntityTypeConfiguration<QuotationItem>
{
    public void Configure(EntityTypeBuilder<QuotationItem> builder)
    {
        builder.ToTable("quotation_items");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Quantity)
            .HasPrecision(12, 3)
            .IsRequired();

        builder.Property(e => e.UnitPrice)
            .HasPrecision(15, 2)
            .IsRequired();

        builder.Property(e => e.DiscountPercent)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(e => e.LineTotal)
            .HasPrecision(15, 2)
            .IsRequired();

        builder.HasOne(e => e.Quotation)
            .WithMany(q => q.Items)
            .HasForeignKey(e => e.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Product)
            .WithMany()
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();

        builder.HasIndex(e => e.QuotationId);
        builder.HasIndex(e => e.ProductId);
    }
}
