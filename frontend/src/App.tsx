import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n';
import './App.css';
import axios from 'axios';
import io from 'socket.io-client';
import { SOCKET_URL } from './config';

import ErrorBoundary from './components/ErrorBoundary';
import { useTheme } from './contexts/ThemeContext';

import Matches from './pages/Matches';
import Teams from './pages/Teams';
import News from './pages/News';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { Provider } from 'react-redux';
import { store } from './store';
import Sidebar from './components/Sidebar';

function AppContent() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { muiTheme } = useTheme();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        await axios.get(`${process.env.REACT_APP_API_BASE_URL}/notifications`);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
      }
    };

    fetchNotifications();
  }, [dispatch]);

  useEffect(() => {
    if (!user?.id) return;
    const socket = io(SOCKET_URL);
    socket.emit('join', user.id);
    socket.on('notification', (data: any) => {
      // dispatch(addNotification({
      //   ...data,
      //   id: `${data.type}-${Date.now()}`
      // }));
    });
    return () => {
      socket.disconnect();
    };
  }, [user, dispatch]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <ErrorBoundary>
        <CssBaseline />
        <Router>
          <Sidebar />
          <main className="main-content">
            <div className="content">
              <Routes>
                <Route path="/" element={<Matches />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/news" element={<News />} />
                <Route path="/favorites" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
        </Router>
        <ToastContainer position="bottom-right" />
      </ErrorBoundary>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppWrapper() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
          <App />
        </LocalizationProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default AppWrapper;
