export enum AttendanceStatus {
  Present = "Present",
  Late = "Late",
  Absent = "Absent",
  Leave = "Leave",
  HalfDay = "HalfDay",
}

export interface AttendanceListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  overtimeHours: number;
  breakMinutes: number;
  status: AttendanceStatus;
  notes: string | null;
  createdAt: string;
}

export interface AttendanceDetail {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  overtimeHours: number;
  breakMinutes: number;
  status: AttendanceStatus;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  year: number;
  month: number;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  halfDayCount: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
}

export interface CreateAttendanceRequest {
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  breakMinutes: number;
  status: AttendanceStatus;
  notes?: string | null;
}

export interface UpdateAttendanceRequest {
  checkIn: string | null;
  checkOut: string | null;
  breakMinutes: number;
  status: AttendanceStatus;
  notes?: string | null;
}

export interface BulkAttendanceRequest {
  date: string;
  items: BulkAttendanceItemRequest[];
}

export interface BulkAttendanceItemRequest {
  employeeId: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  notes?: string | null;
}

export interface FetchAttendanceParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  date?: string;
  status?: AttendanceStatus;
  dateFrom?: string;
  dateTo?: string;
}
