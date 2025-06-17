import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { Provider } from 'react-redux';
import { store } from './store';
import Sidebar from './components/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';

function AppContent() {
  const location = useLocation();
  return (
    <div className="content">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{ minHeight: '100vh' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Matches />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/news" element={<News />} />
            <Route path="/favorites" element={<Notifications />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  const { muiTheme } = useTheme();
  return (
    <MuiThemeProvider theme={muiTheme}>
      <ErrorBoundary>
        <CssBaseline />
        <Router>
          <Sidebar />
          <main className="main-content">
            <AppContent />
          </main>
        </Router>
        <ToastContainer position="bottom-right" />
      </ErrorBoundary>
    </MuiThemeProvider>
  );
}

function AppWrapper() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LocalizationProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default AppWrapper;
