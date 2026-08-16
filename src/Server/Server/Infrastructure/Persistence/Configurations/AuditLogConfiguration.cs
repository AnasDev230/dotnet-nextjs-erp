using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Audit.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");
        builder.HasKey(e => e.Id);

        // Action stored as tinyint (byte) for performance
        builder.Property(e => e.Action)
            .HasConversion<byte>()
            .IsRequired();

        builder.Property(e => e.UserName).HasMaxLength(256);
        builder.Property(e => e.TableName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.OldValues).HasColumnType("nvarchar(max)");
        builder.Property(e => e.NewValues).HasColumnType("nvarchar(max)");
        builder.Property(e => e.IpAddress).HasMaxLength(45);
        builder.Property(e => e.UserAgent).HasMaxLength(500);
        builder.Property(e => e.Timestamp).IsRequired();

        // Indexes for common query patterns
        builder.HasIndex(e => e.Timestamp);           // Date range queries
        builder.HasIndex(e => e.UserId);              // Filter by user
        builder.HasIndex(e => e.TableName);           // Filter by table
        builder.HasIndex(e => e.Action);              // Filter by action type
        builder.HasIndex(e => new { e.TableName, e.Timestamp });  // Combined filter

        // NO QueryFilter — audit logs are never soft-deleted
        // NO RowVersion — audit logs are never updated
    }
}