import { AttendanceRecord, LeaveRequest, AttendanceStats } from '../types';

export const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60) * 100) / 100; // รอบเป็น 2 ตำแหน่ง
};

export const calculateOvertimeHours = (workingHours: number, standardHours: number = 8): number => {
  return Math.max(0, workingHours - standardHours);
};

export const isLate = (checkIn: string, standardStartTime: string = '09:00'): boolean => {
  const checkInTime = new Date(checkIn).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return checkInTime > standardStartTime;
};

export const getAttendanceStatus = (record: AttendanceRecord): string => {
  if (record.status === 'leave') return 'ลา';
  if (record.status === 'absent') return 'ขาด';
  if (record.status === 'late') return 'มาสาย';
  if (record.status === 'present') return 'เข้างาน';
  return 'ไม่ทราบ';
};

export const calculateMonthlyStats = (records: AttendanceRecord[]): AttendanceStats => {
  const totalDays = records.length;
  const presentDays = records.filter(r => r.status === 'present').length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  const leaveDays = records.filter(r => r.status === 'leave').length;
  
  const totalWorkingHours = records
    .filter(r => r.workingHours)
    .reduce((sum, r) => sum + (r.workingHours || 0), 0);
  
  const averageWorkingHours = totalDays > 0 ? totalWorkingHours / totalDays : 0;
  
  const overtimeHours = records
    .filter(r => r.overtimeHours)
    .reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    leaveDays,
    totalWorkingHours,
    averageWorkingHours,
    overtimeHours
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};
