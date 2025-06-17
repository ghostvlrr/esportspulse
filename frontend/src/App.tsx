import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { store } from './store';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n';
import './App.css';
import Sidebar from './components/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import Matches from './pages/Matches';
import Teams from './pages/Teams';
import News from './pages/News';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

// Tema tanımlaması
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF0000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#FF0000 #1E1E1E',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#1E1E1E',
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#FF0000',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#CC0000',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#CC0000',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#CC0000',
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#1E1E1E',
          },
        },
      },
    },
  },
});

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
  return (
    <ThemeProvider>
      <Provider store={store}>
        <MuiThemeProvider theme={muiTheme}>
          <ErrorBoundary>
            <CssBaseline />
            <Router>
              <Sidebar />
              <main className="main-content">
                <AppContent />
              </main>
              <ToastContainer position="bottom-right" />
            </Router>
          </ErrorBoundary>
        </MuiThemeProvider>
      </Provider>
    </ThemeProvider>
  );
}

function AppWrapper() {
  return (
      <HelmetProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
        </LocalizationProvider>
      </HelmetProvider>
  );
}

export default AppWrapper;
