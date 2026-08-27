using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.HR.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class PayrollRunConfiguration : IEntityTypeConfiguration<PayrollRun>
{
    public void Configure(EntityTypeBuilder<PayrollRun> builder)
    {
        builder.ToTable("payroll_runs");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.RunNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(e => e.RunNumber)
            .IsUnique();

        builder.Property(e => e.Month)
            .IsRequired();

        builder.Property(e => e.Year)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasConversion<byte>()
            .IsRequired();

        builder.Property(e => e.TotalNetAmount)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(e => e.EmployeeCount)
            .HasDefaultValue(0);

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        // Unique: one payroll run per (Year, Month)
        builder.HasIndex(e => new { e.Year, e.Month })
            .IsUnique();

        builder.HasIndex(e => e.Status);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
