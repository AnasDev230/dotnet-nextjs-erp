using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Sales.Entities;
using Server.Features.Sales.Enums;

namespace Server.Infrastructure.Persistence.Configurations;

public class SalesReturnConfiguration : IEntityTypeConfiguration<SalesReturn>
{
    public void Configure(EntityTypeBuilder<SalesReturn> builder)
    {
        builder.ToTable("sales_returns");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ReturnNumber)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(e => e.ReturnNumber)
            .IsUnique();

        builder.Property(e => e.Reason)
            .HasMaxLength(500);

        builder.Property(e => e.ReturnDate)
            .IsRequired();

        builder.Property(e => e.TotalAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(e => e.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(ReturnStatus.Draft);

        builder.HasOne(e => e.Invoice)
            .WithMany()
            .HasForeignKey(e => e.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Customer)
            .WithMany()
            .HasForeignKey(e => e.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Warehouse)
            .WithMany()
            .HasForeignKey(e => e.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.InvoiceId);
        builder.HasIndex(e => e.CustomerId);
        builder.HasIndex(e => e.WarehouseId);
        builder.HasIndex(e => e.ReturnDate);
        builder.HasIndex(e => e.Status);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}