import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  History,
  Search,
  FilterList,
  Download,
  Refresh
} from '@mui/icons-material';
import { AttendanceRecord } from '../types';
import { attendanceService } from '../services/attendanceService';
import { formatTime, formatDate, getAttendanceStatus } from '../utils/helpers';

interface AttendanceHistoryProps {
  onRefresh?: () => void;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ onRefresh }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, statusFilter, dateFilter]);

  const loadRecords = () => {
    const allRecords = attendanceService.getAttendanceRecords();
    setRecords(allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Search by employee name
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(record => record.date === dateFilter);
    }

    setFilteredRecords(filtered);
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

  const exportToCSV = () => {
    const csvContent = [
      ['วันที่', 'ชื่อพนักงาน', 'เช็คอิน', 'เช็คเอาท์', 'สถานะ', 'ชั่วโมงทำงาน', 'หมายเหตุ'],
      ...filteredRecords.map(record => [
        formatDate(record.date),
        record.employeeName,
        record.checkIn ? formatTime(record.checkIn) : '-',
        record.checkOut ? formatTime(record.checkOut) : '-',
        getAttendanceStatus(record),
        record.workingHours ? `${record.workingHours} ชั่วโมง` : '-',
        record.notes || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" color="primary">
              <History sx={{ mr: 1, verticalAlign: 'middle' }} />
              ประวัติการเข้างาน
            </Typography>
            <Box>
              <Tooltip title="รีเฟรชข้อมูล">
                <IconButton onClick={loadRecords} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="ส่งออก CSV">
                <IconButton onClick={exportToCSV} color="primary">
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Filters */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
              ตัวกรองข้อมูล
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ค้นหาชื่อพนักงาน"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>สถานะ</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="สถานะ"
                  >
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    <MenuItem value="present">เข้างาน</MenuItem>
                    <MenuItem value="late">มาสาย</MenuItem>
                    <MenuItem value="absent">ขาด</MenuItem>
                    <MenuItem value="leave">ลา</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="วันที่"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Records Table */}
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ชื่อพนักงาน</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เช็คอิน</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เช็คเอาท์</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>สถานะ</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ชั่วโมงทำงาน</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>หมายเหตุ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        ไม่พบข้อมูลการเข้างาน
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id} hover>
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
                        />
                      </TableCell>
                      <TableCell>
                        {record.workingHours ? `${record.workingHours} ชั่วโมง` : '-'}
                      </TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            แสดง {filteredRecords.length} รายการ จากทั้งหมด {records.length} รายการ
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceHistory;
