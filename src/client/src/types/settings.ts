export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  companyNameEn?: string;
  taxNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  currency: string;
}

export interface UpdateCompanySettingsRequest {
  companyName: string;
  companyNameEn?: string;
  taxNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  currency: string;
}

export interface UserProfile {
  id: string;
  userName: string;
  email?: string;
  fullName?: string;
  role: string;
  lastLogin?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserListItem {
  id: string;
  userName: string;
  email?: string;
  fullName?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface UpdateUserRequest {
  fullName: string;
  role: string;
}