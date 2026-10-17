using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Server.Core.Constants;
using Server.Features.Audit.Entities;
using Server.Features.Finance;
using Server.Features.HR.Entities;
using Server.Features.Inventory;
using Server.Features.Purchasing.Entities;
using Server.Features.Sales;
using Server.Features.Sales.Entities;

namespace Server.Infrastructure.Persistence.DemoData;

/// <summary>
/// Generates a large, realistic, English-language demo dataset across every
/// implemented module. Runs only when explicitly enabled (Development +
/// Seed:DemoData). All work is idempotent-safe: the seed aborts immediately if
/// any product already exists.
/// </summary>
public partial class DemoDataSeeder
{
    private const string DemoPassword = "Demo@1234";

    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ILogger _logger;
    private readonly Random _rnd = new(20260101);
    private readonly DateTime _now = DateTime.UtcNow;

    // ── Shared state ──
    private Guid? _adminId;
    private readonly List<ApplicationUser> _users = new();
    private readonly List<(ApplicationUser User, string DepartmentName)> _userLinks = new();

    private readonly List<Department> _departments = new();
    private readonly List<Employee> _employees = new();
    private readonly List<Category> _categories = new();
    private readonly List<Product> _products = new();
    private readonly List<Warehouse> _warehouses = new();
    private readonly List<Customer> _customers = new();
    private readonly List<Supplier> _suppliers = new();
    private readonly List<TaxRate> _taxRates = new();
    private readonly List<SalesOrder> _confirmedOrders = new();
    private readonly List<GoodsReceipt> _goodsReceipts = new();
    private readonly Dictionary<(Guid ProductId, Guid WarehouseId), decimal> _stock = new();

    private readonly List<LeaveRequest> _leaveRequests = new();

    // ── Document counters ──
    private int _catCounter, _prodCounter, _whCounter, _custCounter, _supCounter;
    private int _empCounter, _soCounter, _qtCounter, _invCounter, _sretCounter;
    private int _poCounter, _grnCounter, _sinvCounter, _pretCounter, _trfCounter;
    private int _auditCounter;

    private DemoDataSeeder(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger logger)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    public static async Task SeedAsync(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger logger)
    {
        if (await context.Products.AnyAsync())
        {
            logger.LogInformation("Demo data already present — skipping demo data seeding.");
            return;
        }

        var seeder = new DemoDataSeeder(context, userManager, roleManager, logger);
        await seeder.RunAsync();
    }

    private async Task RunAsync()
    {
        _context.AuditEnabled = false;

        var admin = await _userManager.FindByEmailAsync("admin@bunyan.com");
        _adminId = admin?.Id;
        if (_adminId is not null)
            _users.Add(admin!);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            await SeedUsersAsync();
            SeedCompanySettings();
            await SaveAsync("company settings & users");

            SeedDepartments();
            SeedEmployees();
            await SaveAsync("departments & employees");

            LinkDepartmentManagers();
            await SaveAsync("department managers");

            await LinkUsersToEmployeesAsync();
            await SaveAsync("user/employee links");

            SeedCategories();
            SeedWarehouses();
            SeedProducts();
            InitializeOpeningStock();
            await SaveAsync("inventory catalog");

            _taxRates.AddRange(await _context.TaxRates.AsNoTracking().ToListAsync());

            await SeedPurchasingAsync();
            await SaveAsync("purchasing documents");

            SeedSalesAsync();
            await SaveAsync("sales documents");

            SeedInventoryDocuments();
            SeedInventoryLevels();
            await SaveAsync("inventory levels & movements");

            SeedAttendance();
            await SaveAsync("attendance");

            SeedPayroll();
            await SaveAsync("payroll");

            SeedLeaveRequests();
            await SaveAsync("leave requests");

            SeedNotifications();
            SeedAuditLogs();
            await SaveAsync("notifications & audit");

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        _logger.LogInformation(
            "Demo data generated: {Products} products, {Customers} customers, {Suppliers} suppliers, {Employees} employees, {Orders} sales orders, {POs} purchase orders.",
            _products.Count, _customers.Count, _suppliers.Count, _employees.Count, _confirmedOrders.Count, _poCounter);
    }

    private async Task SaveAsync(string stage)
    {
        await _context.SaveChangesAsync();
        _logger.LogInformation("Demo data seeded: {Stage}.", stage);
    }

    // ────────────────────────────── Helpers ──────────────────────────────

    private int Int(int minInclusive, int maxExclusive) => _rnd.Next(minInclusive, maxExclusive);

    private decimal Money(decimal min, decimal max) =>
        Math.Round(min + (decimal)_rnd.NextDouble() * (max - min), 2);

    private decimal Qty(decimal min, decimal max) =>
        Math.Round(min + (decimal)_rnd.NextDouble() * (max - min), 3);

    private T Pick<T>(IReadOnlyList<T> list) => list[_rnd.Next(list.Count)];

    private bool Chance(int percent) => _rnd.Next(100) < percent;

    private DateOnly DateOnlyBefore(int maxDaysAgo, int minDaysAgo = 0) =>
        DateOnly.FromDateTime(_now.Date.AddDays(-_rnd.Next(minDaysAgo, maxDaysAgo)));

    private DateTime DateTimeBefore(int maxDaysAgo, int minDaysAgo = 0) =>
        _now.Date.AddDays(-_rnd.Next(minDaysAgo, maxDaysAgo))
            .AddHours(_rnd.Next(8, 19))
            .AddMinutes(_rnd.Next(0, 60));

    private Guid OwnerId => _adminId ?? Guid.Empty;

    private decimal GetStock(Guid productId, Guid warehouseId)
    {
        var key = (productId, warehouseId);
        if (!_stock.TryGetValue(key, out var value))
        {
            value = Int(300, 1600);
            _stock[key] = value;
        }
        return value;
    }

    private void ApplyStock(Guid productId, Guid warehouseId, decimal delta)
    {
        var key = (productId, warehouseId);
        _stock[key] = Math.Max(0, GetStock(productId, warehouseId) + delta);
    }

    private void AddMovement(
        string movementType,
        string referenceType,
        Guid referenceId,
        Guid productId,
        Guid warehouseId,
        decimal quantity,
        decimal unitCost,
        DateTime date,
        string? notes = null)
    {
        ApplyStock(productId, warehouseId, quantity);

        _context.StockMovements.Add(new StockMovement
        {
            MovementType = movementType,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            ProductId = productId,
            WarehouseId = warehouseId,
            Quantity = quantity,
            UnitCost = unitCost,
            TotalCost = Math.Round(Math.Abs(quantity) * unitCost, 2),
            MovementDate = date,
            Notes = notes,
            CreatedBy = OwnerId,
            CreatedAt = date
        });
    }

    private string NewCode(string prefix, int counter, int pad = 3) =>
        $"{prefix}-{counter.ToString().PadLeft(pad, '0')}";

    private string NewDocNumber(string prefix, int counter) =>
        $"{prefix}-{DateOnly.FromDateTime(_now).Year}-{counter.ToString().PadLeft(4, '0')}";

    private static string Json(string key, string value) =>
        $"{{\"{key}\":\"{value.Replace("\"", "\\\"")}\"}}";
}
