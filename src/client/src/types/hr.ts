export enum EmployeeStatus {
  Active = 0,
  OnLeave = 1,
  Terminated = 2,
}

export enum EmploymentType {
  FullTime = 0,
  PartTime = 1,
  Contract = 2,
  Intern = 3,
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DepartmentListItem {
  id: string;
  code: string;
  name: string;
  parentName: string | null;
  managerName: string | null;
  employeeCount: number;
  isActive: boolean;
}

export interface DepartmentDetail {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  managerId: string | null;
  managerName: string | null;
  description: string | null;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  parentId?: string | null;
  managerId?: string | null;
  description?: string | null;
}

export interface UpdateDepartmentRequest {
  name: string;
  parentId?: string | null;
  managerId?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface EmployeeListItem {
  id: string;
  employeeNumber: string;
  fullName: string;
  departmentName: string | null;
  jobTitle: string | null;
  status: EmployeeStatus;
  hireDate: string;
}

export interface EmployeeDetail {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  hireDate: string;
  departmentId: string | null;
  departmentName: string | null;
  jobTitle: string | null;
  employmentType: EmploymentType;
  salary: number;
  currency: string;
  managerId: string | null;
  managerName: string | null;
  status: EmployeeStatus;
  userId: string | null;
  userName: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  hireDate: string;
  departmentId?: string | null;
  jobTitle?: string | null;
  employmentType: EmploymentType;
  salary: number;
  managerId?: string | null;
  userId?: string | null;
  notes?: string | null;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  hireDate: string;
  departmentId?: string | null;
  jobTitle?: string | null;
  employmentType: EmploymentType;
  salary: number;
  managerId?: string | null;
  status: EmployeeStatus;
  userId?: string | null;
  notes?: string | null;
}
