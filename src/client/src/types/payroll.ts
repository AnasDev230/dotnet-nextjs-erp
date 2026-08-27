export enum PayrollStatus {
  Draft = "Draft",
  Processing = "Processing",
  Completed = "Completed",
  Paid = "Paid",
}

export interface PayrollRunListItem {
  id: string;
  runNumber: string;
  month: number;
  year: number;
  status: PayrollStatus;
  totalNetAmount: number;
  employeeCount: number;
  processedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PayrollRunDetail {
  id: string;
  runNumber: string;
  month: number;
  year: number;
  status: PayrollStatus;
  totalNetAmount: number;
  employeeCount: number;
  processedAt: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PayrollDetailListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  baseSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
}

export interface PayrollDetail {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  baseSalary: number;
  transportAllowance: number;
  housingAllowance: number;
  overtimePay: number;
  otherAllowances: number;
  totalEarnings: number;
  lateDeduction: number;
  absentDeduction: number;
  insuranceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  overtimeHours: number;
  notes: string | null;
}

export interface CreatePayrollRunRequest {
  month: number;
  year: number;
  notes?: string | null;
}

export interface FetchPayrollParams {
  page?: number;
  pageSize?: number;
}
