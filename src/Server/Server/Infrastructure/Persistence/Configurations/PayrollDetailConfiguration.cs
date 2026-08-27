using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.HR.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class PayrollDetailConfiguration : IEntityTypeConfiguration<PayrollDetail>
{
    public void Configure(EntityTypeBuilder<PayrollDetail> builder)
    {
        builder.ToTable("payroll_details");
        builder.HasKey(e => e.Id);

        // ─── Relationships ───
        builder.HasOne(e => e.PayrollRun)
            .WithMany(r => r.Details)
            .HasForeignKey(e => e.PayrollRunId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Employee)
            .WithMany()
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        // ─── Earnings ───
        builder.Property(e => e.BaseSalary).HasPrecision(15, 2).IsRequired();
        builder.Property(e => e.TransportAllowance).HasPrecision(15, 2).HasDefaultValue(0m);
        builder.Property(e => e.HousingAllowance).HasPrecision(15, 2).HasDefaultValue(0m);
        builder.Property(e => e.OvertimePay).HasPrecision(15, 2).HasDefaultValue(0m);
        builder.Property(e => e.OtherAllowances).HasPrecision(15, 2).HasDefaultValue(0m);
        builder.Property(e => e.TotalEarnings).HasPrecision(15, 2).HasDefaultValue(0m);

        // ─── Deductions ───
        builder.Property(e => e.LateDeduction).HasPrecision(15, 2).HasDefaultValue(0m);
        builder.Property(e => e.AbsentDeduction).HasPrecision(15, 2).HasDefaultValue(0m);
        builder.Property(e => e.InsuranceDeduction).HasPrecision(15, 2).HasDefaultValue(0m);
        builder.Property(e => e.OtherDeductions).HasPrecision(15, 2).HasDefaultValue(0m);
        builder.Property(e => e.TotalDeductions).HasPrecision(15, 2).HasDefaultValue(0m);

        // ─── Net ───
        builder.Property(e => e.NetPay).HasPrecision(15, 2).IsRequired();

        // ─── Attendance summary ───
        builder.Property(e => e.PresentDays).HasDefaultValue(0);
        builder.Property(e => e.LateDays).HasDefaultValue(0);
        builder.Property(e => e.AbsentDays).HasDefaultValue(0);
        builder.Property(e => e.OvertimeHours).HasPrecision(5, 2).HasDefaultValue(0m);

        // ─── Notes ───
        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        // Unique: one detail per (PayrollRunId, EmployeeId)
        builder.HasIndex(e => new { e.PayrollRunId, e.EmployeeId })
            .IsUnique();

        builder.HasIndex(e => e.EmployeeId);
        builder.HasIndex(e => e.PayrollRunId);

        // Soft delete filter
        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
