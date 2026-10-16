using Microsoft.AspNetCore.Identity;
using Server.Core.Constants;
using Server.Features.Settings.Entities;

namespace Server.Infrastructure.Persistence.DemoData;

public partial class DemoDataSeeder
{
    private void SeedCompanySettings()
    {
        if (_context.CompanySettings.Any())
            return;

        _context.CompanySettings.Add(new CompanySettings
        {
            CompanyName = "Bunyan Trading Company",
            CompanyNameEn = "Bunyan Trading Company",
            TaxNumber = "300012345600003",
            Phone = "+966 11 234 5678",
            Email = "info@bunyan.com",
            Address = "King Fahd Road, Al Olaya District",
            City = "Riyadh",
            Country = "Saudi Arabia",
            Currency = "SAR",
            CreatedBy = OwnerId,
            CreatedAt = _now.AddDays(-420)
        });
    }

    private async Task SeedUsersAsync()
    {
        var demoUsers = new (string Email, string FullName, string Role, string Department)[]
        {
            ("sales@bunyan.com", "Sarah Hassan", Roles.SalesManager, "Sales"),
            ("purchasing@bunyan.com", "Paul Nasser", Roles.PurchasingManager, "Purchasing"),
            ("warehouse@bunyan.com", "Walid Faris", Roles.WarehouseKeeper, "Warehouse"),
            ("hr@bunyan.com", "Hana Kamal", Roles.HRManager, "Human Resources"),
            ("demo@bunyan.com", "Demo Administrator", Roles.SuperAdmin, "Executive")
        };

        if (_adminId is not null && _users.Count > 0)
            _userLinks.Add((_users[0], "Executive"));

        foreach (var definition in demoUsers)
        {
            var existing = await _userManager.FindByEmailAsync(definition.Email);
            if (existing is not null)
            {
                _users.Add(existing);
                _userLinks.Add((existing, definition.Department));
                continue;
            }

            var user = new ApplicationUser
            {
                UserName = definition.Email,
                Email = definition.Email,
                FullName = definition.FullName,
                EmailConfirmed = true,
                IsActive = true,
                CreatedAt = DateTimeBefore(400, 360),
                LastLogin = DateTimeBefore(15, 1)
            };

            var result = await _userManager.CreateAsync(user, DemoPassword);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Could not create demo user {Email}: {Errors}",
                    definition.Email, string.Join("; ", result.Errors.Select(e => e.Description)));
                continue;
            }

            await _userManager.AddToRoleAsync(user, definition.Role);
            _users.Add(user);
            _userLinks.Add((user, definition.Department));
        }
    }

    private Task LinkUsersToEmployeesAsync()
    {
        foreach (var (user, departmentName) in _userLinks)
        {
            if (user.EmployeeId is not null)
                continue;

            var department = _departments.FirstOrDefault(d => d.Name == departmentName);
            if (department is null)
                continue;

            var employee = _employees.FirstOrDefault(e => e.DepartmentId == department.Id && e.UserId is null);
            if (employee is null)
                continue;

            employee.UserId = user.Id;
            user.EmployeeId = employee.Id;
        }

        return Task.CompletedTask;
    }
}
