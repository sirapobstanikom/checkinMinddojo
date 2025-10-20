import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  AccessTime,
  Login,
  Logout,
  Person,
  Schedule
} from '@mui/icons-material';
import { AttendanceRecord, Employee } from '../types';
import { attendanceService } from '../services/attendanceService';
import { formatTime, getCurrentDateTime } from '../utils/helpers';

interface CheckInOutProps {
  onAttendanceUpdate?: () => void;
}

const CheckInOut: React.FC<CheckInOutProps> = ({ onAttendanceUpdate }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    setEmployees(attendanceService.getEmployees());
    attendanceService.initializeSampleData();
  }, []);

  useEffect(() => {
    if (employeeId) {
      const today = new Date().toISOString().split('T')[0];
      const record = attendanceService.getAttendanceRecords().find(
        r => r.employeeId === employeeId && r.date === today
      );
      setCurrentRecord(record || null);
    }
  }, [employeeId]);

  const handleEmployeeSelect = (selectedEmployee: Employee) => {
    setEmployeeId(selectedEmployee.id);
    setEmployeeName(selectedEmployee.name);
    setMessage(null);
  };

  const handleCheckIn = () => {
    if (!employeeId || !employeeName) {
      setMessage({ type: 'error', text: 'กรุณาเลือกพนักงาน' });
      return;
    }

    try {
      const record = attendanceService.checkIn(employeeId, employeeName);
      setCurrentRecord(record);
      setMessage({ type: 'success', text: 'เช็คอินสำเร็จ!' });
      onAttendanceUpdate?.();
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเช็คอิน' });
    }
  };

  const handleCheckOut = () => {
    if (!employeeId) {
      setMessage({ type: 'error', text: 'กรุณาเลือกพนักงาน' });
      return;
    }

    try {
      const record = attendanceService.checkOut(employeeId);
      if (record) {
        setCurrentRecord(record);
        setMessage({ type: 'success', text: 'เช็คเอาท์สำเร็จ!' });
        onAttendanceUpdate?.();
      } else {
        setMessage({ type: 'error', text: 'ไม่พบข้อมูลการเช็คอินวันนี้' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเช็คเอาท์' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      case 'leave': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'เข้างาน';
      case 'late': return 'มาสาย';
      case 'absent': return 'ขาด';
      case 'leave': return 'ลา';
      default: return 'ไม่ทราบ';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
            Checkinminddojo
          </Typography>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Employee Selection */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  เลือกพนักงาน
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {employees.map((employee) => (
                    <Chip
                      key={employee.id}
                      label={employee.name}
                      onClick={() => handleEmployeeSelect(employee)}
                      color={employeeId === employee.id ? 'primary' : 'default'}
                      variant={employeeId === employee.id ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Current Status */}
            {currentRecord && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    สถานะวันนี้
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        ชื่อ: {currentRecord.employeeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        วันที่: {new Date(currentRecord.date).toLocaleDateString('th-TH')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        สถานะ: 
                        <Chip 
                          label={getStatusText(currentRecord.status)} 
                          color={getStatusColor(currentRecord.status) as any}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      {currentRecord.checkIn && (
                        <Typography variant="body2" color="text.secondary">
                          เช็คอิน: {formatTime(currentRecord.checkIn)}
                        </Typography>
                      )}
                      {currentRecord.checkOut && (
                        <Typography variant="body2" color="text.secondary">
                          เช็คเอาท์: {formatTime(currentRecord.checkOut)}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<Login />}
                  onClick={handleCheckIn}
                  disabled={!employeeId || (currentRecord && currentRecord.checkIn)}
                  sx={{ minWidth: 150 }}
                >
                  เช็คอิน
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<Logout />}
                  onClick={handleCheckOut}
                  disabled={!employeeId || !currentRecord || !currentRecord.checkIn || currentRecord.checkOut}
                  sx={{ minWidth: 150 }}
                >
                  เช็คเอาท์
                </Button>
              </Box>
            </Grid>

            {/* Current Time */}
            <Grid item xs={12}>
              <Typography variant="h6" align="center" color="text.secondary">
                เวลาปัจจุบัน: {new Date().toLocaleTimeString('th-TH')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CheckInOut;
