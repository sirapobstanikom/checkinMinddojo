import { AttendanceRecord, LeaveRequest, Employee, DashboardData } from '../types';
import { generateId, getCurrentDateTime, getCurrentDate } from '../utils/helpers';

class AttendanceService {
  private getStorageKey(key: string): string {
    return `attendance_${key}`;
  }

  // Attendance Records
  getAttendanceRecords(): AttendanceRecord[] {
    const data = localStorage.getItem(this.getStorageKey('records'));
    return data ? JSON.parse(data) : [];
  }

  saveAttendanceRecord(record: AttendanceRecord): void {
    const records = this.getAttendanceRecords();
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    localStorage.setItem(this.getStorageKey('records'), JSON.stringify(records));
  }

  getTodayAttendance(): AttendanceRecord[] {
    const today = getCurrentDate();
    return this.getAttendanceRecords().filter(record => record.date === today);
  }

  // Leave Requests
  getLeaveRequests(): LeaveRequest[] {
    const data = localStorage.getItem(this.getStorageKey('leaves'));
    return data ? JSON.parse(data) : [];
  }

  saveLeaveRequest(leave: LeaveRequest): void {
    const leaves = this.getLeaveRequests();
    const existingIndex = leaves.findIndex(l => l.id === leave.id);
    
    if (existingIndex >= 0) {
      leaves[existingIndex] = leave;
    } else {
      leaves.push(leave);
    }
    
    localStorage.setItem(this.getStorageKey('leaves'), JSON.stringify(leaves));
  }

  // Employees
  getEmployees(): Employee[] {
    const data = localStorage.getItem(this.getStorageKey('employees'));
    return data ? JSON.parse(data) : [];
  }

  saveEmployee(employee: Employee): void {
    const employees = this.getEmployees();
    const existingIndex = employees.findIndex(e => e.id === employee.id);
    
    if (existingIndex >= 0) {
      employees[existingIndex] = employee;
    } else {
      employees.push(employee);
    }
    
    localStorage.setItem(this.getStorageKey('employees'), JSON.stringify(employees));
  }

  // Check In/Out
  checkIn(employeeId: string, employeeName: string): AttendanceRecord {
    const today = getCurrentDate();
    const existingRecord = this.getAttendanceRecords().find(
      r => r.employeeId === employeeId && r.date === today
    );

    if (existingRecord) {
      existingRecord.checkIn = getCurrentDateTime();
      existingRecord.status = 'present';
      this.saveAttendanceRecord(existingRecord);
      return existingRecord;
    }

    const newRecord: AttendanceRecord = {
      id: generateId(),
      employeeId,
      employeeName,
      date: today,
      checkIn: getCurrentDateTime(),
      status: 'present'
    };

    this.saveAttendanceRecord(newRecord);
    return newRecord;
  }

  checkOut(employeeId: string): AttendanceRecord | null {
    const today = getCurrentDate();
    const record = this.getAttendanceRecords().find(
      r => r.employeeId === employeeId && r.date === today
    );

    if (record && record.checkIn) {
      record.checkOut = getCurrentDateTime();
      this.saveAttendanceRecord(record);
      return record;
    }

    return null;
  }

  // Dashboard Data
  getDashboardData(): DashboardData {
    const todayAttendance = this.getTodayAttendance();
    const recentRecords = this.getAttendanceRecords()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    const pendingLeaves = this.getLeaveRequests()
      .filter(l => l.status === 'pending')
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRecords = this.getAttendanceRecords().filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    return {
      todayAttendance,
      recentRecords,
      pendingLeaves,
      monthlyStats: this.calculateMonthlyStats(monthlyRecords)
    };
  }

  private calculateMonthlyStats(records: AttendanceRecord[]) {
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
  }

  // Initialize with sample data
  initializeSampleData(): void {
    if (this.getEmployees().length === 0) {
      const sampleEmployee: Employee = {
        id: generateId(),
        name: 'พนักงานตัวอย่าง',
        position: 'นักพัฒนา',
        department: 'IT',
        email: 'employee@example.com',
        phone: '081-234-5678',
        hireDate: '2024-01-01',
        workingHours: {
          start: '09:00',
          end: '18:00'
        }
      };
      this.saveEmployee(sampleEmployee);
    }
  }
}

export const attendanceService = new AttendanceService();
