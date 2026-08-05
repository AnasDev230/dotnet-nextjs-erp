using FluentValidation;
using Server.Core.Common;
using Server.Core.Common.Contracts;
using Server.Features.Dashboard.Repositories;
using Server.Features.Dashboard.Services;
using Server.Features.Finance.Repositories;
using Server.Features.Finance.Services;
using Server.Features.Inventory.Repositories;
using Server.Features.Inventory.Services;
using Server.Features.Sales.Repositories;
using Server.Features.Sales.Services;
using Server.Features.Security.Repositories;
using Server.Features.Security.Services;
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
        services.AddScoped<IInventoryReservationService, InventoryReservationService>();

        // Sales
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ISalesOrderRepository, SalesOrderRepository>();
        services.AddScoped<ISalesOrderService, SalesOrderService>();
        services.AddScoped<ITaxRateRepository, TaxRateRepository>();

        // Finance
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IPaymentService, PaymentService>();

        // Dashboard (read-only aggregations across Sales, Finance & Inventory)
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
