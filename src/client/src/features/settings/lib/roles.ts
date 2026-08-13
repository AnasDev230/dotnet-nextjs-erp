export const roleKeyMap: Record<string, string> = {
  SuperAdmin: "settings.roles.superAdmin",
  SalesManager: "settings.roles.salesManager",
  PurchasingManager: "settings.roles.purchasingManager",
  WarehouseKeeper: "settings.roles.warehouseKeeper",
  HRManager: "settings.roles.hrManager",
};

export const roleOptions: { value: string; labelKey: string }[] = [
  { value: "SuperAdmin", labelKey: "settings.roles.superAdmin" },
  { value: "SalesManager", labelKey: "settings.roles.salesManager" },
  { value: "PurchasingManager", labelKey: "settings.roles.purchasingManager" },
  { value: "WarehouseKeeper", labelKey: "settings.roles.warehouseKeeper" },
  { value: "HRManager", labelKey: "settings.roles.hrManager" },
];