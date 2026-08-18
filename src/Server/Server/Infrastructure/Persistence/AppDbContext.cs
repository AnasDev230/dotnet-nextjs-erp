using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Server.Core.Common;
using Server.Features.Audit.Entities;
using Server.Features.Audit.Enums;
using Server.Features.Finance;
using Server.Features.HR.Entities;
using Server.Features.Inventory;
using Server.Features.Purchasing.Entities;
using Server.Features.Sales;
using Server.Features.Security;
using Server.Features.Settings.Entities;

namespace Server.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<InventoryLevel> InventoryLevels => Set<InventoryLevel>();
    public DbSet<StockAdjustment> StockAdjustments => Set<StockAdjustment>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderItem> SalesOrderItems => Set<SalesOrderItem>();
    public DbSet<TaxRate> TaxRates => Set<TaxRate>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();

    // Purchasing Module
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PoItem> PoItems => Set<PoItem>();
    public DbSet<GoodsReceipt> GoodsReceipts => Set<GoodsReceipt>();
    public DbSet<GoodsReceiptItem> GoodsReceiptItems => Set<GoodsReceiptItem>();
    public DbSet<ProductSupplier> ProductSuppliers => Set<ProductSupplier>();

    // HR Module
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();

    // Settings Module
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();

    // Audit Trail
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    private readonly Guid? _currentUserId;
    private readonly string? _currentUserName;
    private readonly string? _currentIpAddress;
    private readonly string? _currentUserAgent;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ICurrentUserService currentUserService,
        IHttpContextAccessor httpContextAccessor)
        : base(options)
    {
        _currentUserId = currentUserService.UserId;
        _currentUserName = currentUserService.UserName;
        _currentIpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        _currentUserAgent = httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(e => e.FullName)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("SYSDATETIME()");

            entity.HasIndex(e => e.EmployeeId)
                .IsUnique()
                .HasFilter("[EmployeeId] IS NOT NULL");
        });

        builder.Entity<ApplicationRole>(entity =>
        {
            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.IsSystemRole)
                .HasDefaultValue(false);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Token)
                .HasMaxLength(512)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("SYSDATETIME()");

            entity.Property(e => e.ExpiresAt)
                .IsRequired();

            entity.HasIndex(e => e.Token)
                .IsUnique();

            entity.HasIndex(e => e.UserId);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<IdentityUserLogin<Guid>>(entity =>
        {
            entity.HasKey(e => new { e.LoginProvider, e.ProviderKey });
        });

        builder.Entity<IdentityUserRole<Guid>>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId });
        });

        builder.Entity<IdentityUserToken<Guid>>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name });
        });

        ApplySoftDeleteFilters(builder);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess = true)
    {
        AddAuditEntries();
        ApplyAuditRules();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AddAuditEntries();
        ApplyAuditRules();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditRules()
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is BaseEntity && e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted);

        foreach (var entry in entries)
        {
            if (entry.Entity is BaseEntity entity)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entity.CreatedAt = DateTime.UtcNow;
                        break;

                    case EntityState.Modified:
                        entity.UpdatedAt = DateTime.UtcNow;
                        break;

                    case EntityState.Deleted:
                        entry.State = EntityState.Modified;
                        entity.DeletedAt = DateTime.UtcNow;
                        break;
                }
            }
        }
    }

    private void AddAuditEntries()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Where(e => e.Entity is not AuditLog)  // Prevent infinite loop
            .ToList();

        foreach (var entry in entries)
        {
            var tableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name;

            // Skip excluded tables
            if (IsExcludedTable(tableName)) continue;

            var auditLog = new AuditLog
            {
                UserId = _currentUserId,
                UserName = _currentUserName,
                Action = MapAction(entry.State),
                TableName = tableName,
                RecordId = GetRecordId(entry),
                IpAddress = _currentIpAddress,
                UserAgent = _currentUserAgent,
                Timestamp = DateTime.UtcNow
            };

            // Capture values based on action type
            switch (entry.State)
            {
                case EntityState.Added:
                    auditLog.NewValues = SerializeCurrentValues(entry);
                    break;
                case EntityState.Modified:
                    auditLog.OldValues = SerializeModifiedOriginalValues(entry);
                    auditLog.NewValues = SerializeModifiedCurrentValues(entry);
                    break;
                case EntityState.Deleted:
                    auditLog.OldValues = SerializeCurrentValues(entry);
                    break;
            }

            AuditLogs.Add(auditLog);
        }
    }

    private static AuditAction MapAction(EntityState state) => state switch
    {
        EntityState.Added => AuditAction.Create,
        EntityState.Modified => AuditAction.Update,
        EntityState.Deleted => AuditAction.Delete,
        _ => AuditAction.Update
    };

    private static bool IsExcludedTable(string tableName)
    {
        var excluded = new[]
        {
            "audit_logs",
            "AspNetUserTokens",
            "RefreshTokens"
        };
        return excluded.Contains(tableName);
    }

    private static Guid? GetRecordId(EntityEntry entry)
    {
        var primaryKey = entry.Metadata.FindPrimaryKey();
        if (primaryKey == null || primaryKey.Properties.Count == 0) return null;

        var keyProperty = primaryKey.Properties[0];
        var value = entry.Property(keyProperty.Name).CurrentValue;
        return value is Guid guid ? guid : null;
    }

    private static bool IsSensitiveProperty(string propertyName)
    {
        var sensitive = new[]
        {
            "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
            "RowVersion", "NormalizedUserName", "NormalizedEmail"
        };
        return sensitive.Contains(propertyName);
    }

    private static string SerializeCurrentValues(EntityEntry entry)
    {
        var values = new Dictionary<string, object?>();

        foreach (var property in entry.Properties)
        {
            var name = property.Metadata.Name;
            if (property.Metadata.IsForeignKey()) continue;
            if (IsSensitiveProperty(name)) continue;

            values[name] = property.CurrentValue;
        }

        return JsonSerializer.Serialize(values);
    }

    private static string SerializeModifiedOriginalValues(EntityEntry entry)
    {
        var values = new Dictionary<string, object?>();

        foreach (var property in entry.Properties)
        {
            var name = property.Metadata.Name;
            if (property.Metadata.IsForeignKey()) continue;
            if (IsSensitiveProperty(name)) continue;
            if (!property.IsModified) continue;

            values[name] = property.OriginalValue;
        }

        return JsonSerializer.Serialize(values);
    }

    private static string SerializeModifiedCurrentValues(EntityEntry entry)
    {
        var values = new Dictionary<string, object?>();

        foreach (var property in entry.Properties)
        {
            var name = property.Metadata.Name;
            if (property.Metadata.IsForeignKey()) continue;
            if (IsSensitiveProperty(name)) continue;
            if (!property.IsModified) continue;

            values[name] = property.CurrentValue;
        }

        return JsonSerializer.Serialize(values);
    }

    private static void ApplySoftDeleteFilters(ModelBuilder builder)
    {
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(AppDbContext)
                    .GetMethod(nameof(SetSoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);

                method.Invoke(null, [builder]);
            }
        }
    }

    private static void SetSoftDeleteFilter<T>(ModelBuilder builder) where T : BaseEntity
    {
        builder.Entity<T>().HasQueryFilter(e => e.DeletedAt == null);
    }
}
