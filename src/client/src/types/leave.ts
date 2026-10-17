export enum LeaveStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Cancelled = "Cancelled",
}

export enum LeaveType {
  Annual = "Annual",
  Sick = "Sick",
  Unpaid = "Unpaid",
  Maternity = "Maternity",
  Emergency = "Emergency",
  Other = "Other",
}

export interface LeaveRequestListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  status: LeaveStatus;
  createdAt: string;
}

export interface LeaveRequestDetail {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  status: LeaveStatus;
  reason: string;
  decisionNote: string | null;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateLeaveRequest {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface RejectLeaveRequest {
  decisionNote: string;
}

export interface CancelLeaveRequest {
  decisionNote?: string | null;
}

export interface FetchLeaveRequestsParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  dateFrom?: string;
  dateTo?: string;
}

export interface LeaveTypeSummaryItem {
  leaveType: LeaveType;
  daysUsed: number;
  requestCount: number;
}

export interface LeaveSummary {
  employeeId: string;
  employeeName: string;
  year: number;
  totalApprovedDays: number;
  byType: LeaveTypeSummaryItem[];
}
