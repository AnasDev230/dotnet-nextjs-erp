using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.HR.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
{
    public void Configure(EntityTypeBuilder<Attendance> builder)
    {
        builder.ToTable("attendance");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Date)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(e => e.WorkHours)
            .HasPrecision(5, 2);

        builder.Property(e => e.OvertimeHours)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasConversion<byte>()
            .IsRequired();

        builder.Property(e => e.Notes)
            .HasMaxLength(500);

        // Unique: one attendance per employee per day
        builder.HasIndex(e => new { e.EmployeeId, e.Date })
            .IsUnique();

        builder.HasOne(e => e.Employee)
            .WithMany()
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();

        builder.HasIndex(e => e.Date);
        builder.HasIndex(e => e.Status);
    }
}
