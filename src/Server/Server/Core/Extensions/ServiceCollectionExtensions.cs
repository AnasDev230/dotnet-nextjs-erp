using FluentValidation;
using Server.Core.Common;
using Server.Core.Common.Contracts;
using Server.Features.Audit.Repositories;
using Server.Features.Audit.Services;
using Server.Features.Dashboard.Repositories;
using Server.Features.Dashboard.Services;
using Server.Features.Finance.Repositories;
using Server.Features.Finance.Services;
using Server.Features.HR.Repositories;
using Server.Features.HR.Services;
using Server.Features.Inventory.Repositories;
using Server.Features.Inventory.Services;
using Server.Features.Purchasing.Repositories;
using Server.Features.Purchasing.Services;
using Server.Features.Reports.Repositories;
using Server.Features.Reports.Services;
using Server.Features.Sales.Repositories;
using Server.Features.Sales.Services;
using Server.Features.Search.Repositories;
using Server.Features.Search.Services;
using Server.Features.Security.Repositories;
using Server.Features.Security.Services;
using Server.Features.Settings.Repositories;
using Server.Features.Settings.Services;
using Server.Infrastructure.Services;

namespace Server.Core.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<Program>();

        // HTTP Context
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // Security
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IAuthService, AuthService>();

        // Inventory
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IWarehouseRepository, WarehouseRepository>();
        services.AddScoped<IWarehouseService, WarehouseService>();
        services.AddScoped<IInventoryLevelRepository, InventoryLevelRepository>();
        services.AddScoped<IInventoryLevelService, InventoryLevelService>();
        services.AddScoped<IStockAdjustmentRepository, StockAdjustmentRepository>();
        services.AddScoped<IStockAdjustmentService, StockAdjustmentService>();
        services.AddScoped<IStockTransferRepository, StockTransferRepository>();
        services.AddScoped<IStockTransferService, StockTransferService>();
        services.AddScoped<IInventoryReservationService, InventoryReservationService>();

        // Sales
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ISalesOrderRepository, SalesOrderRepository>();
        services.AddScoped<ISalesOrderService, SalesOrderService>();
        services.AddScoped<ISalesReturnRepository, SalesReturnRepository>();
        services.AddScoped<ISalesReturnService, SalesReturnService>();
        services.AddScoped<ITaxRateRepository, TaxRateRepository>();

        // Purchasing
        services.AddScoped<ISupplierRepository, SupplierRepository>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
        services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
        services.AddScoped<IGoodsReceiptRepository, GoodsReceiptRepository>();
        services.AddScoped<IGoodsReceiptService, GoodsReceiptService>();
        services.AddScoped<IProductSupplierRepository, ProductSupplierRepository>();
        services.AddScoped<IProductSupplierService, ProductSupplierService>();
        services.AddScoped<ISupplierInvoiceRepository, SupplierInvoiceRepository>();
        services.AddScoped<ISupplierInvoiceService, SupplierInvoiceService>();
        services.AddScoped<IPurchasePaymentRepository, PurchasePaymentRepository>();
        services.AddScoped<IPurchasePaymentService, PurchasePaymentService>();
        services.AddScoped<IPurchaseReturnRepository, PurchaseReturnRepository>();
        services.AddScoped<IPurchaseReturnService, PurchaseReturnService>();

        // Finance
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IPaymentService, PaymentService>();

        // Dashboard (read-only aggregations across Sales, Finance & Inventory)
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<IDashboardService, DashboardService>();

        // HR
        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IEmployeeService, EmployeeService>();

        // Reports (read-only aggregation across Sales, Purchasing, Inventory & HR)
        services.AddScoped<IReportsRepository, ReportsRepository>();
        services.AddScoped<IReportsService, ReportsService>();

        // Settings
        services.AddScoped<ICompanySettingsRepository, CompanySettingsRepository>();
        services.AddScoped<ICompanySettingsService, CompanySettingsService>();
        services.AddScoped<IUsersManagementService, UsersManagementService>();
        services.AddScoped<IProfileService, ProfileService>();

        // Search (read-only cross-cutting feature searching all modules)
        services.AddScoped<ISearchRepository, SearchRepository>();
        services.AddScoped<ISearchService, SearchService>();

        // Audit Trail (read-only, SuperAdmin only)
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IAuditLogService, AuditLogService>();

        return services;
    }
}
