import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { markAsRead, removeNotification } from '../store/slices/notificationSlice';
import { NotificationItem, NotificationType } from '../types/notification';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Alert,
  AlertTitle,
  Stack,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTheme as useMuiTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getNotifications } from '../services/notificationService';
import { Notification } from '../types/notification';
import { Card, CardContent, Avatar } from '@mui/material';
import { Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';

// Bildirim mesaj havuzları
const finalMessages = [
  "Büyük final zamanı! {team1} ile {team2} şampiyonluk için karşı karşıya!",
  "Tarihe tanıklık et! {team1} vs {team2} finali başlıyor!",
  "Şampiyon belli oluyor! {team1} ve {team2} kozlarını paylaşıyor!"
];
const semiFinalMessages = [
  "Yarı final heyecanı! {team1} ile {team2} finale bir adım uzaklıkta.",
  "Finale giden yol: {team1} vs {team2} yarı finalde karşı karşıya!"
];
const groupMessages = [
  "Grup aşaması başlıyor! {team1} ve {team2} sahnede.",
  "Puanlar için mücadele: {team1} vs {team2} grup maçı!"
];
const showmatchMessages = [
  "Gösteri zamanı! {team1} ile {team2} eğlenceli bir maçta karşı karşıya.",
  "Şov başlasın! {team1} vs {team2} gösteri maçı için hazır."
];
const defaultMessages = [
  "Heyecan başlıyor! {team1} vs {team2} maçı için bildirimler açık!",
  "Hazır mısın? {team1} ile {team2} arasındaki mücadele başlamak üzere!",
  "Maç başlıyor! {team1} ve {team2} karşı karşıya, gözünü ayırma!",
  "Koltuklara kurul! {team1} vs {team2} maçı için bildirimler aktif.",
  "Sahne senin! {team1} ile {team2} maçı başlamak üzere, heyecan dorukta!",
  "Büyük an geldi! {team1} ve {team2} kozlarını paylaşacak!",
  "Takımlar arenada! {team1} vs {team2} maçı için bildirimler açık.",
  "Adrenalin tavan! {team1} ile {team2} maçı başlamak üzere.",
  "Şampiyonluk yolunda {team1} ve {team2} karşı karşıya!",
  "Efsane bir maç seni bekliyor: {team1} vs {team2}!"
];

function getRandomMessage(messages: string[], team1: string, team2: string) {
  const msg = messages[Math.floor(Math.random() * messages.length)];
  return msg.replace('{team1}', team1).replace('{team2}', team2);
}

function getImportanceMessage(round: string, team1: string, team2: string) {
  if (!round) return getRandomMessage(defaultMessages, team1, team2);
  const r = round.toLowerCase();
  if (r.includes('final') && !r.includes('yarı')) return getRandomMessage(finalMessages, team1, team2);
  if (r.includes('yarı')) return getRandomMessage(semiFinalMessages, team1, team2);
  if (r.includes('grup')) return getRandomMessage(groupMessages, team1, team2);
  if (r.includes('show')) return getRandomMessage(showmatchMessages, team1, team2);
  return getRandomMessage(defaultMessages, team1, team2);
}

const Notifications: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread' | 'live'>('all');
  const itemsPerPage = 10;
  const [showSuccess, setShowSuccess] = useState(false);

  // Maç bildirimleri için localStorage'dan kontrol
  let matchNotificationMessage = '';
  let matchNotificationItem: NotificationItem | null = null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('match_notifications_')) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const obj = JSON.parse(data);
          if (obj.enabled) {
            // Anahtardan maç adını ve round bilgisini ayıkla
            const parts = key.replace('match_notifications_', '').split('_');
            if (parts.length >= 3) {
              const team1 = parts[1];
              const team2 = parts[2];
              let round = obj.round_info || obj.match_series || '';
              const uniqueKey = `${parts[0]}_${team1}_${team2}_${parts.slice(3).join('_')}`;
              const messageKey = `match_notification_message_${uniqueKey}`;
              const timeKey = `match_notification_time_${uniqueKey}`;
              const savedTime = localStorage.getItem(timeKey);
              const timestamp = savedTime ? new Date(savedTime).toISOString() : new Date().toISOString();
              const savedMessage = localStorage.getItem(messageKey);
              matchNotificationMessage = savedMessage || getImportanceMessage(round, team1, team2);
              matchNotificationItem = {
                id: `local_${team1}_${team2}`,
                title: `${team1} vs ${team2}`,
                message: matchNotificationMessage,
                timestamp,
                read: true,
                type: 'matchStart',
              };
              break;
            }
          }
        } catch {}
      }
    }
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (event: any) => {
    setFilter(event.target.value);
    setPage(1);
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  const handleClearAll = () => {
    notifications.forEach(notification => {
      dispatch(removeNotification(notification.id));
    });
    // LocalStorage'daki tüm maç bildirimlerini sil
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('match_notifications_') || 
          key.startsWith('match_notification_message_') || 
          key.startsWith('match_notification_time_')) {
        localStorage.removeItem(key);
      }
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    // Başarı mesajı göster
    toast.success('Tüm bildirimler başarıyla kapatıldı');
  };

  let filteredNotifications = [...notifications];
  if (filter === 'live') {
    filteredNotifications = notifications.filter(
      n => ['matchStart', 'scoreChange', 'matchEnd'].includes(n.type)
    );
  } else if (filter === 'unread') {
    filteredNotifications = notifications.filter(n => !n.read && ['matchStart', 'scoreChange', 'matchEnd'].includes(n.type));
  }

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'matchStart':
      case 'scoreChange':
      case 'matchEnd':
        return <SportsEsportsIcon />;
      case 'news':
        return <InfoIcon />;
      case 'system':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'success':
        return <CheckCircleIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'matchStart':
      case 'scoreChange':
      case 'matchEnd':
        return 'info';
      case 'news':
        return 'success';
      case 'system':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  const getNotificationMessage = (notification: NotificationItem) => {
    switch (notification.type) {
      case 'matchStart':
        return `${notification.title} maçı başlamak üzere! ${notification.message}`;
      case 'scoreChange':
        return `${notification.title} maçında skor değişti! ${notification.message}`;
      case 'matchEnd':
        return `${notification.title} maçı sona erdi! ${notification.message}`;
      case 'news':
        return notification.message;
      default:
        return notification.message;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
            Bildirimler
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} yeni`}
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filtrele</InputLabel>
            <Select
              value={filter}
              label="Filtrele"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="unread">Okunmamış</MenuItem>
              <MenuItem value="live">Canlı Maçlar</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearAll}
            startIcon={<DeleteIcon />}
          >
            Tümünü Temizle
          </Button>
        </Box>
      </Box>

      {currentNotifications.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Bildirim Yok</AlertTitle>
          Henüz hiç bildiriminiz bulunmuyor.
        </Alert>
      ) : (
        <List>
          {currentNotifications.map((notification) => (
            <Paper
              key={notification.id}
              elevation={1}
              sx={{ 
                mb: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
                >
                  <ListItem
                alignItems="flex-start"
                    sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  position: 'relative',
                    }}
                  >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getNotificationIcon(notification.type)}
                      <Typography
                        component="span"
                        variant="subtitle1"
                        color="text.primary"
                        sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                      >
                          {notification.title}
                        </Typography>
                      {!notification.read && (
                        <Chip
                          label="Yeni"
                          color="primary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                      }
                      secondary={
                        <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                            {getNotificationMessage(notification)}
                          </Typography>
                        </>
                      }
                    />
                <Box sx={{ display: 'flex', gap: 1 }}>
                      {!notification.read && (
                    <Button
                            size="small"
                            onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ minWidth: 'auto' }}
                          >
                      Okundu
                    </Button>
                      )}
                        <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveNotification(notification.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                </Box>
                  </ListItem>
            </Paper>
              ))}
            </List>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
              </Box>
          )}
    </Container>
  );
};

export default Notifications; 