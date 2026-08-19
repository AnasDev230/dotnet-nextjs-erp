using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;

namespace Server.Infrastructure.Persistence.Configurations;

public class SupplierInvoiceConfiguration : IEntityTypeConfiguration<SupplierInvoice>
{
    public void Configure(EntityTypeBuilder<SupplierInvoice> builder)
    {
        builder.ToTable("supplier_invoices");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.InvoiceNumber).HasMaxLength(30).IsRequired();
        builder.HasIndex(e => e.InvoiceNumber).IsUnique();

        builder.Property(e => e.Subtotal).HasPrecision(15, 2).IsRequired();
        builder.Property(e => e.TaxAmount).HasPrecision(15, 2).IsRequired();
        builder.Property(e => e.NetAmount).HasPrecision(15, 2).IsRequired();
        builder.Property(e => e.PaidAmount).HasPrecision(15, 2).IsRequired();
        builder.Property(e => e.Notes).HasMaxLength(1000);
        builder.Property(e => e.SupplierReference).HasMaxLength(100);

        builder.Property(e => e.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(SupplierInvoiceStatus.Draft);

        builder.HasOne(e => e.PurchaseOrder)
            .WithMany(po => po.SupplierInvoices)
            .HasForeignKey(e => e.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Supplier)
            .WithMany(s => s.SupplierInvoices)
            .HasForeignKey(e => e.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.SupplierId);
        builder.HasIndex(e => e.PurchaseOrderId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.DueDate);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}