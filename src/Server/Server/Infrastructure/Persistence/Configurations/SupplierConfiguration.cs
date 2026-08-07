using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;

namespace Server.Infrastructure.Persistence.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("suppliers");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.Code).IsUnique();

        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.ContactPerson).HasMaxLength(200);
        builder.Property(e => e.Email).HasMaxLength(200);
        builder.Property(e => e.Phone).HasMaxLength(50);
        builder.Property(e => e.TaxNumber).HasMaxLength(50);
        builder.Property(e => e.Rating).HasPrecision(3, 2);

        builder.Property(e => e.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(SupplierStatus.Active);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
