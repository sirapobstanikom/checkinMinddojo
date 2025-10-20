import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Dashboard from '../components/Dashboard';
import CheckInOut from '../components/CheckInOut';
import AttendanceHistory from '../components/AttendanceHistory';
import LeaveManagement from '../components/LeaveManagement';
import Navigation from '../components/Navigation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation />
          <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/checkin" element={<CheckInOut />} />
              <Route path="/history" element={<AttendanceHistory />} />
              <Route path="/leave" element={<LeaveManagement />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
