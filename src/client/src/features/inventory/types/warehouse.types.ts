export interface WarehouseListItem {
  id: string;
  code: string;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface WarehouseDetail extends WarehouseListItem {}

export interface CreateWarehouseRequest {
  code: string;
  name: string;
  location?: string;
}

export interface UpdateWarehouseRequest {
  name: string;
  location?: string;
  isActive: boolean;
}
