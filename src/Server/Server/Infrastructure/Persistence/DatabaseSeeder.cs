using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Server.Core.Constants;
using Server.Features.Sales;

namespace Server.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger logger)
    {
        try
        {
            await context.Database.MigrateAsync();
            await SeedRolesAsync(roleManager, logger);
            await SeedSuperAdminAsync(userManager, logger);
            await SeedTaxRatesAsync(context, logger);

            logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database seeding failed.");
            throw;
        }
    }

    private static async Task SeedRolesAsync(
        RoleManager<ApplicationRole> roleManager,
        ILogger logger)
    {
        var mvpRoles = new (string Name, string Description)[]
{
    (Roles.SuperAdmin, "Super Administrator - Full access to all system modules and settings"),
    (Roles.SalesManager, "Sales Manager - Manage sales orders, customers, and invoices"),
    (Roles.WarehouseKeeper, "Warehouse Keeper - Manage products, inventory levels, and stock movements")
};

        foreach (var (name, description) in mvpRoles)
        {
            if (!await roleManager.RoleExistsAsync(name))
            {
                var role = new ApplicationRole
                {
                    Name = name,
                    NormalizedName = name.ToUpperInvariant(),
                    Description = description,
                    IsSystemRole = true
                };

                var result = await roleManager.CreateAsync(role);

                if (result.Succeeded)
                    logger.LogInformation("Created role: {RoleName}", name);
                else
                    logger.LogWarning("Failed to create role: {RoleName}. Errors: {Errors}",
                        name, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
            else
            {
                logger.LogInformation("Role already exists: {RoleName}", name);
            }
        }
    }

    private static async Task SeedSuperAdminAsync(
        UserManager<ApplicationUser> userManager,
        ILogger logger)
    {
        const string adminEmail = "admin@bunyan.com";
        const string adminPassword = "Admin@123456";
        const string adminFullName = "System Administrator";

        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);

        if (existingAdmin is not null)
        {
            logger.LogInformation("SuperAdmin already exists: {Email}", adminEmail);
            return;
        }

        var admin = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            NormalizedUserName = adminEmail.ToUpperInvariant(),
            NormalizedEmail = adminEmail.ToUpperInvariant(),
            FullName = adminFullName,
            IsActive = true,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(admin, adminPassword);

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, Roles.SuperAdmin);
            logger.LogInformation("Created SuperAdmin user: {Email}", adminEmail);
        }
        else
        {
            logger.LogError("Failed to create SuperAdmin. Errors: {Errors}",
                string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }

    private static async Task SeedTaxRatesAsync(AppDbContext context, ILogger logger)
    {
        var taxRates = new[]
        {
            new TaxRate { Name = "معفى من الضريبة", Rate = 0m, IsActive = true },
            new TaxRate { Name = "ضريبة مخفضة", Rate = 5m, IsActive = true },
            new TaxRate { Name = "ضريبة المبيعات", Rate = 11m, IsActive = true }
        };

        foreach (var rate in taxRates)
        {
            var exists = await context.TaxRates.AnyAsync(t => t.Name == rate.Name);
            if (!exists)
            {
                context.TaxRates.Add(rate);
                logger.LogInformation("Created tax rate: {Name} ({Rate}%)", rate.Name, rate.Rate);
            }
            else
            {
                logger.LogInformation("Tax rate already exists: {Name}", rate.Name);
            }
        }

        await context.SaveChangesAsync();
    }
}
