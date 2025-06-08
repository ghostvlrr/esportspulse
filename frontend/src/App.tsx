import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
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

import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';
import { SOCKET_URL } from './services/api';

import Matches from './pages/Matches';
import Teams from './pages/Teams';
import News from './pages/News';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { Provider } from 'react-redux';
import { store } from './store';
import Sidebar from './components/Sidebar';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Bildirimleri yükle
    const fetchNotifications = async () => {
      try {
        await axios.get(`${process.env.REACT_APP_API_BASE_URL}/notifications`);
        // dispatch(setNotifications(response.data));
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
    <ErrorBoundary>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <div className="content">
            <Routes>
              <Route path="/" element={<Matches />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/news" element={<News />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
      <ToastContainer position="bottom-right" />
    </ErrorBoundary>
  );
}

function AppWrapper() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <App />
            </Router>
          </ThemeProvider>
        </LocalizationProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default AppWrapper;
