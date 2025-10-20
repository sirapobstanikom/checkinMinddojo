import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  EventNote,
  Add,
  Edit,
  Check,
  Close,
  CalendarToday,
  Person
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import { LeaveRequest, Employee } from '../types';
import { attendanceService } from '../services/attendanceService';
import { formatDate, generateId, getCurrentDateTime } from '../utils/helpers';

interface LeaveManagementProps {
  onLeaveUpdate?: () => void;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ onLeaveUpdate }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    type: 'sick' as const,
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    reason: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLeaves(attendanceService.getLeaveRequests());
    setEmployees(attendanceService.getEmployees());
    attendanceService.initializeSampleData();
  };

  const handleOpenDialog = (leave?: LeaveRequest) => {
    if (leave) {
      setEditingLeave(leave);
      setFormData({
        employeeId: leave.employeeId,
        employeeName: leave.employeeName,
        type: leave.type,
        startDate: dayjs(leave.startDate),
        endDate: dayjs(leave.endDate),
        reason: leave.reason
      });
    } else {
      setEditingLeave(null);
      setFormData({
        employeeId: '',
        employeeName: '',
        type: 'sick',
        startDate: null,
        endDate: null,
        reason: ''
      });
    }
    setOpenDialog(true);
    setMessage(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLeave(null);
    setFormData({
      employeeId: '',
      employeeName: '',
      type: 'sick',
      startDate: null,
      endDate: null,
      reason: ''
    });
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setFormData(prev => ({
      ...prev,
      employeeId: employee.id,
      employeeName: employee.name
    }));
  };

  const calculateDays = (startDate: Dayjs, endDate: Dayjs): number => {
    return endDate.diff(startDate, 'day') + 1;
  };

  const handleSubmit = () => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return;
    }

    if (formData.startDate.isAfter(formData.endDate)) {
      setMessage({ type: 'error', text: 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด' });
      return;
    }

    const leaveData: LeaveRequest = {
      id: editingLeave?.id || generateId(),
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      type: formData.type,
      startDate: formData.startDate.format('YYYY-MM-DD'),
      endDate: formData.endDate.format('YYYY-MM-DD'),
      days: calculateDays(formData.startDate, formData.endDate),
      reason: formData.reason,
      status: editingLeave?.status || 'pending',
      submittedAt: editingLeave?.submittedAt || getCurrentDateTime()
    };

    try {
      attendanceService.saveLeaveRequest(leaveData);
      loadData();
      handleCloseDialog();
      setMessage({ type: 'success', text: editingLeave ? 'อัปเดตข้อมูลลาเรียบร้อย' : 'ส่งคำขอลาเรียบร้อย' });
      onLeaveUpdate?.();
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
  };

  const handleApprove = (leaveId: string) => {
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
      leave.status = 'approved';
      leave.approvedAt = getCurrentDateTime();
      leave.approvedBy = 'ผู้จัดการ';
      attendanceService.saveLeaveRequest(leave);
      loadData();
      onLeaveUpdate?.();
    }
  };

  const handleReject = (leaveId: string) => {
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
      leave.status = 'rejected';
      leave.approvedAt = getCurrentDateTime();
      leave.approvedBy = 'ผู้จัดการ';
      attendanceService.saveLeaveRequest(leave);
      loadData();
      onLeaveUpdate?.();
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'sick': return 'ลาป่วย';
      case 'vacation': return 'ลาพักผ่อน';
      case 'personal': return 'ลาส่วนตัว';
      case 'emergency': return 'ลาฉุกเฉิน';
      default: return 'ไม่ทราบ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอการอนุมัติ';
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ไม่อนุมัติ';
      default: return 'ไม่ทราบ';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" color="primary">
                <EventNote sx={{ mr: 1, verticalAlign: 'middle' }} />
                การจัดการลา
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ minWidth: 150 }}
              >
                ขอลาใหม่
              </Button>
            </Box>

            {message && (
              <Alert severity={message.type} sx={{ mb: 2 }}>
                {message.text}
              </Alert>
            )}

            {/* Leave Requests Table */}
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ชื่อพนักงาน</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ประเภทลา</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่เริ่ม</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่สิ้นสุด</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>จำนวนวัน</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เหตุผล</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>สถานะ</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>การดำเนินการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          ไม่มีข้อมูลการลา
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaves.map((leave) => (
                      <TableRow key={leave.id} hover>
                        <TableCell>{leave.employeeName}</TableCell>
                        <TableCell>{getTypeText(leave.type)}</TableCell>
                        <TableCell>{formatDate(leave.startDate)}</TableCell>
                        <TableCell>{formatDate(leave.endDate)}</TableCell>
                        <TableCell>{leave.days} วัน</TableCell>
                        <TableCell>{leave.reason}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(leave.status)}
                            color={getStatusColor(leave.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="แก้ไข">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(leave)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            {leave.status === 'pending' && (
                              <>
                                <Tooltip title="อนุมัติ">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleApprove(leave.id)}
                                    color="success"
                                  >
                                    <Check />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="ไม่อนุมัติ">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleReject(leave.id)}
                                    color="error"
                                  >
                                    <Close />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Leave Request Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
            {editingLeave ? 'แก้ไขข้อมูลลา' : 'ขอลาใหม่'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  เลือกพนักงาน
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {employees.map((employee) => (
                    <Chip
                      key={employee.id}
                      label={employee.name}
                      onClick={() => handleEmployeeSelect(employee)}
                      color={formData.employeeId === employee.id ? 'primary' : 'default'}
                      variant={formData.employeeId === employee.id ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>ประเภทลา</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    label="ประเภทลา"
                  >
                    <MenuItem value="sick">ลาป่วย</MenuItem>
                    <MenuItem value="vacation">ลาพักผ่อน</MenuItem>
                    <MenuItem value="personal">ลาส่วนตัว</MenuItem>
                    <MenuItem value="emergency">ลาฉุกเฉิน</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  จำนวนวัน: {formData.startDate && formData.endDate ? calculateDays(formData.startDate, formData.endDate) : 0} วัน
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="วันที่เริ่มต้น"
                  value={formData.startDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="วันที่สิ้นสุด"
                  value={formData.endDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="เหตุผล"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>ยกเลิก</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingLeave ? 'อัปเดต' : 'ส่งคำขอ'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default LeaveManagement;
