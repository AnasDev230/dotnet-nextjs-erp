using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;

namespace Server.Infrastructure.Persistence.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.EmployeeNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(e => e.EmployeeNumber)
            .IsUnique();

        builder.Property(e => e.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Email)
            .HasMaxLength(200);

        builder.HasIndex(e => e.Email)
            .IsUnique()
            .HasFilter("[Email] IS NOT NULL");

        builder.Property(e => e.Phone)
            .HasMaxLength(50);

        builder.Property(e => e.JobTitle)
            .HasMaxLength(200);

        builder.Property(e => e.Salary)
            .HasPrecision(15, 2)
            .HasDefaultValue(0m);

        builder.Property(e => e.Currency)
            .HasMaxLength(10)
            .HasDefaultValue("SAR");

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        // tinyint in DB, enum in C#
        builder.Property(e => e.Status)
            .HasColumnType("tinyint")
            .HasDefaultValue(EmployeeStatus.Active);

        // tinyint in DB, enum in C#
        builder.Property(e => e.EmploymentType)
            .HasColumnType("tinyint")
            .HasDefaultValue(EmploymentType.FullTime);

        // Department
        builder.HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        // Manager (self-reference)
        builder.HasOne(e => e.Manager)
            .WithMany(e => e.Subordinates)
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // User link (one-to-one, optional)
        builder.HasOne(e => e.User)
            .WithOne()
            .HasForeignKey<Employee>(e => e.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.UserId)
            .IsUnique()
            .HasFilter("[UserId] IS NOT NULL");

        builder.HasIndex(e => e.DepartmentId);
        builder.HasIndex(e => e.ManagerId);
        builder.HasIndex(e => e.Status);

        // Soft delete filter
        builder.HasQueryFilter(e => e.DeletedAt == null);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}