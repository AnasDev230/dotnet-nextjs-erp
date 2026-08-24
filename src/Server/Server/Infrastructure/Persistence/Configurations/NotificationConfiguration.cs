using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.Notifications.Entities;

namespace Server.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Message)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.Type)
            .HasConversion<byte>()
            .IsRequired();

        // Indexes
        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => new { e.UserId, e.IsRead }); // Unread count
        builder.HasIndex(e => e.CreatedAt);
        builder.HasIndex(e => e.ExpiresAt);
    }
}
