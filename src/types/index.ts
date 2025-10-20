export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  workingHours?: number;
  overtimeHours?: number;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'sick' | 'vacation' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  workingHours: {
    start: string;
    end: string;
  };
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  totalWorkingHours: number;
  averageWorkingHours: number;
  overtimeHours: number;
}

export interface DashboardData {
  todayAttendance: AttendanceRecord[];
  recentRecords: AttendanceRecord[];
  pendingLeaves: LeaveRequest[];
  monthlyStats: AttendanceStats;
}
