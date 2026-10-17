using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.HR.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.ToTable("leave_requests");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.LeaveType)
            .HasConversion<byte>()
            .IsRequired();

        builder.Property(e => e.StartDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(e => e.EndDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(e => e.DaysRequested)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasConversion<byte>()
            .IsRequired();

        builder.Property(e => e.Reason)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.DecisionNote)
            .HasMaxLength(500);

        builder.HasOne(e => e.Employee)
            .WithMany()
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Approver)
            .WithMany()
            .HasForeignKey(e => e.ApprovedBy)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.EmployeeId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.StartDate);

        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}
