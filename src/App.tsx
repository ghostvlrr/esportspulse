import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import io from 'socket.io-client';
import { ErrorBoundary } from 'react-error-boundary';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-hot-toast';
import { setNotifications, addNotification } from './store/slices/notificationSlice';
import { RootState } from './store';
import Sidebar from './components/Sidebar';
import Matches from './pages/Matches';
import Teams from './pages/Teams';
import News from './pages/News';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

function AppContent() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/notifications');
        if (response.data) {
          dispatch(setNotifications(response.data));
        }
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
      dispatch(addNotification({
        ...data,
        id: `${data.type}-${Date.now()}`
      }));
    });
    return () => {
      socket.disconnect();
    };
  }, [user, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary fallback={<div>Bir hata oluştu</div>}>
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
    </ThemeProvider>
  );
}

export default AppContent; 