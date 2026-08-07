namespace Server.Core.Constants;

public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string SalesManager = "SalesManager";
    public const string WarehouseKeeper = "WarehouseKeeper";
    public const string PurchasingManager = "PurchasingManager";

    public static readonly string[] AllAdmins = { SuperAdmin };
    public static readonly string[] AllManagers = { SuperAdmin, SalesManager, WarehouseKeeper, PurchasingManager };
}
