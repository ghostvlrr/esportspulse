import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Paper,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updatePreferences, NotificationPreferences } from '../store/slices/notificationSlice';
import { notificationService } from '../services/notificationService';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

const NotificationSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { preferences, userId } = useSelector((state: RootState) => state.notifications);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const savedPreferences = localStorage.getItem('notificationPreferences');
        if (savedPreferences) {
          const parsedPreferences = JSON.parse(savedPreferences);
          dispatch(updatePreferences(parsedPreferences));
        }
      } catch (error) {
        console.error('Bildirim tercihleri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, [dispatch]);

  const handlePreferenceChange = (key: keyof NotificationPreferences) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPreferences = {
      ...preferences,
      [key]: event.target.checked,
    };
    dispatch(updatePreferences(newPreferences));
    notificationService.updatePreferences(newPreferences);
  };

  const handleToggleAllNotifications = () => {
    const allDisabled = Object.values(preferences).every(value => !value);
    const newPreferences = Object.keys(preferences).reduce((acc, key) => ({
      ...acc,
      [key]: !allDisabled
    }), {} as NotificationPreferences);

    dispatch(updatePreferences(newPreferences));
    notificationService.updatePreferences(newPreferences);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const allNotificationsDisabled = Object.values(preferences).every(value => !value);

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Bildirim Ayarları
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={allNotificationsDisabled ? <NotificationsIcon /> : <NotificationsOffIcon />}
          onClick={handleToggleAllNotifications}
        >
          {allNotificationsDisabled ? 'Tüm Bildirimleri Aç' : 'Tüm Bildirimleri Kapat'}
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.matchStart}
              onChange={handlePreferenceChange('matchStart')}
              color="primary"
            />
          }
          label="Maç Başlangıç Bildirimleri"
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 2 }}>
          Maç başlangıç bildirimleri
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={preferences.scoreUpdate}
              onChange={handlePreferenceChange('scoreUpdate')}
              color="primary"
            />
          }
          label="Skor Değişikliği Bildirimleri"
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 2 }}>
          Canlı maç skor değişiklikleri
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={preferences.matchEnd}
              onChange={handlePreferenceChange('matchEnd')}
              color="primary"
            />
          }
          label="Maç Sonu Bildirimleri"
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 2 }}>
          Maç sonuç bildirimleri
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={preferences.news}
              onChange={handlePreferenceChange('news')}
              color="primary"
            />
          }
          label="Haber Bildirimleri"
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 2 }}>
          Önemli haberler ve güncellemeler
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={preferences.system}
              onChange={handlePreferenceChange('system')}
              color="primary"
            />
          }
          label="Sistem Bildirimleri"
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 2 }}>
          Sistem güncellemeleri ve bakım bildirimleri
        </Typography>
      </FormGroup>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Not: Bildirim ayarlarınız tarayıcınızda saklanacak ve oturum açtığınızda otomatik olarak yüklenecektir.
        </Typography>
      </Box>
    </Paper>
  );
};

export default NotificationSettings; 