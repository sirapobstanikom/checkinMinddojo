import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  People,
  AccessTime,
  EventNote,
  TrendingUp,
  Refresh,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { DashboardData, AttendanceRecord, LeaveRequest } from '../types';
import { attendanceService } from '../services/attendanceService';
import { formatTime, formatDate, getAttendanceStatus } from '../utils/helpers';

interface DashboardProps {
  onRefresh?: () => void;
}

const DashboardComponent: React.FC<DashboardProps> = ({ onRefresh }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    try {
      const data = attendanceService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
    onRefresh?.();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle color="success" />;
      case 'late': return <Schedule color="warning" />;
      case 'absent': return <Cancel color="error" />;
      case 'leave': return <EventNote color="info" />;
      default: return <Cancel color="disabled" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          ไม่สามารถโหลดข้อมูลได้
        </Typography>
      </Box>
    );
  }

  const { todayAttendance, recentRecords, pendingLeaves, monthlyStats } = dashboardData;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" color="primary">
          <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
          แดชบอร์ด
        </Typography>
        <Tooltip title="รีเฟรชข้อมูล">
          <IconButton onClick={handleRefresh} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {monthlyStats.totalDays}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    วันทำงานทั้งหมด
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" color="success.main">
                    {monthlyStats.presentDays}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    เข้างาน
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" color="warning.main">
                    {monthlyStats.lateDays}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    มาสาย
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" color="info.main">
                    {monthlyStats.totalWorkingHours.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ชั่วโมงทำงาน
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Attendance */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                การเข้างานวันนี้
              </Typography>
              {todayAttendance.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  ยังไม่มีข้อมูลการเข้างานวันนี้
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={1}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ชื่อ</TableCell>
                        <TableCell>เช็คอิน</TableCell>
                        <TableCell>สถานะ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayAttendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.employeeName}</TableCell>
                          <TableCell>
                            {record.checkIn ? formatTime(record.checkIn) : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getAttendanceStatus(record)}
                              color={getStatusColor(record.status) as any}
                              size="small"
                              icon={getStatusIcon(record.status)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Leave Requests */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <EventNote sx={{ mr: 1, verticalAlign: 'middle' }} />
                คำขอลาที่รอการอนุมัติ
              </Typography>
              {pendingLeaves.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  ไม่มีคำขอลาที่รอการอนุมัติ
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={1}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ชื่อ</TableCell>
                        <TableCell>ประเภท</TableCell>
                        <TableCell>จำนวนวัน</TableCell>
                        <TableCell>วันที่</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingLeaves.slice(0, 5).map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.employeeName}</TableCell>
                          <TableCell>
                            {leave.type === 'sick' ? 'ลาป่วย' :
                             leave.type === 'vacation' ? 'ลาพักผ่อน' :
                             leave.type === 'personal' ? 'ลาส่วนตัว' : 'ลาฉุกเฉิน'}
                          </TableCell>
                          <TableCell>{leave.days} วัน</TableCell>
                          <TableCell>{formatDate(leave.startDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Attendance Records */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                ประวัติการเข้างานล่าสุด
              </Typography>
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>วันที่</TableCell>
                      <TableCell>ชื่อพนักงาน</TableCell>
                      <TableCell>เช็คอิน</TableCell>
                      <TableCell>เช็คเอาท์</TableCell>
                      <TableCell>สถานะ</TableCell>
                      <TableCell>ชั่วโมงทำงาน</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRecords.slice(0, 10).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.employeeName}</TableCell>
                        <TableCell>
                          {record.checkIn ? formatTime(record.checkIn) : '-'}
                        </TableCell>
                        <TableCell>
                          {record.checkOut ? formatTime(record.checkOut) : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getAttendanceStatus(record)}
                            color={getStatusColor(record.status) as any}
                            size="small"
                            icon={getStatusIcon(record.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {record.workingHours ? `${record.workingHours} ชั่วโมง` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardComponent;
