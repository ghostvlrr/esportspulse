import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { removeNotification, NotificationItem } from '../store/slices/notificationSlice';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Box,
  Paper,
  useTheme,
  alpha,
  Chip,
  Stack,
  Tooltip,
  Fade,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { motion, AnimatePresence } from 'framer-motion';

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
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const [showSuccess, setShowSuccess] = useState(false);
  const [pagedNotifications, setPagedNotifications] = useState<NotificationItem[]>([]);

  // Maç bildirimleri için localStorage'dan kontrol
  const matchNotificationItems: NotificationItem[] = useMemo(() => {
    const items: NotificationItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('match_notifications_')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const obj = JSON.parse(data);
            const parts = key.replace('match_notifications_', '').split('_');
            if (parts.length >= 3) {
              const team1 = parts[1];
              const team2 = parts[2];
              let round = obj.round_info || obj.match_series || '';
              const uniqueKey = `${parts[0]}_${team1}_${team2}_${parts.slice(3).join('_')}`;
              const messageKey = `match_notification_message_${uniqueKey}`;
              const timeKey = `match_notification_time_${uniqueKey}`;
              const savedTime = localStorage.getItem(timeKey);
              const timestamp = savedTime ? new Date(savedTime) : new Date();
              const savedMessage = localStorage.getItem(messageKey);
              const matchNotificationMessage = savedMessage || getImportanceMessage(round, team1, team2);
              items.push({
                id: `local_${team1}_${team2}`,
                title: `${team1} vs ${team2}`,
                message: matchNotificationMessage,
                timestamp,
                read: true,
                type: 'matchStart',
              });
            }
          } catch {}
        }
      }
    }
    return items;
  }, [localStorage.length]);

  useEffect(() => {
    setCurrentPage(1); // Bildirimler veya filtre değişince baştan başla
    let notifs = notifications;
    if (filter === 'all') {
      notifs = notifications.filter(
        n => n.type === 'matchStart' || n.type === 'scoreChange'
      );
    } else if (filter === 'unread') {
      notifs = notifications.filter(n => !n.read && (n.type === 'matchStart' || n.type === 'scoreChange'));
    }
    if (matchNotificationItems.length > 0) {
      notifs = [...matchNotificationItems, ...notifs];
    }
    setFilteredNotifications(notifs);
  }, [notifications, filter, matchNotificationItems]);

  useEffect(() => {
    setPagedNotifications(filteredNotifications.slice(0, currentPage * pageSize));
  }, [filteredNotifications, currentPage, pageSize]);

  const hasMore = filteredNotifications.length > pagedNotifications.length;

  const handleDelete = (id: string) => {
    dispatch(removeNotification(id));
    // Eğer localStorage'da maç bildirimi ise onu da sil
    if (id.startsWith('local_')) {
      // id: local_team1_team2
      const parts = id.split('_');
      if (parts.length >= 3) {
        // Tüm olası anahtarları kontrol et
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('match_notifications_')) {
            if (key.includes(parts[1]) && key.includes(parts[2])) {
              localStorage.removeItem(key);
              break;
            }
          }
        }
      }
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'matchStart':
        return <SportsEsportsIcon />;
      case 'scoreChange':
        return <ScoreboardIcon />;
      case 'matchEnd':
        return <EmojiEventsIcon />;
      case 'news':
        return <NotificationsActiveIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'matchStart':
        return theme.palette.primary.main;
      case 'scoreChange':
        return theme.palette.warning.main;
      case 'matchEnd':
        return theme.palette.success.main;
      case 'news':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getNotificationStyle = (type: NotificationItem['type'], read: boolean) => {
    const color = getNotificationColor(type);
    return {
      backgroundColor: alpha(color, read ? 0.05 : 0.1),
      borderLeft: `4px solid ${color}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: alpha(color, read ? 0.1 : 0.15),
        transform: 'translateX(4px)',
      }
    };
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

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    let notifs = notifications;
    if (newFilter === 'all') {
      notifs = notifications.filter(
        n => n.type === 'matchStart' || n.type === 'scoreChange'
      );
    } else if (newFilter === 'unread') {
      notifs = notifications.filter(n => !n.read && (n.type === 'matchStart' || n.type === 'scoreChange'));
    }
    if (matchNotificationItems.length > 0) {
      notifs = [...matchNotificationItems, ...notifs];
    }
    setFilteredNotifications(notifs);
  };

  // Tüm bildirimleri temizle fonksiyonu (artık localStorage'dan da siler)
  const handleClearAllNotifications = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('match_notifications_') || key.startsWith('match_notification_message_') || key.startsWith('match_notification_time_')) {
        localStorage.removeItem(key);
      }
    });
    setFilteredNotifications([]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* {matchNotificationMessage && (
        <Box sx={{ mb: 2, p: 2, background: 'rgba(255,0,0,0.08)', borderRadius: 2, textAlign: 'center', fontWeight: 600, color: '#FF0000', fontSize: 18 }}>
          {matchNotificationMessage}
        </Box>
      )} */}
      <Paper 
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {showSuccess && (
          <Box sx={{ mb: 2, p: 2, background: 'rgba(0,200,0,0.12)', borderRadius: 2, textAlign: 'center', fontWeight: 600, color: '#1db954', fontSize: 18 }}>
            Tüm bildirimler başarıyla kapatıldı!
          </Box>
        )}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FF0000 30%, #171717 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Bildirimler
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Chip
              icon={<NotificationsIcon />}
              label="Tümü"
              onClick={() => handleFilterChange('all')}
              color={filter === 'all' ? 'primary' : 'default'}
              variant={filter === 'all' ? 'filled' : 'outlined'}
              sx={{ 
                borderRadius: 2,
                background: filter === 'all' ? 'rgba(255,0,0,0.1)' : undefined,
                color: filter === 'all' ? '#FF0000' : undefined,
                '&:hover': {
                  backgroundColor: 'rgba(255,0,0,0.1)'
                }
              }}
            />
            <Chip
              icon={<NotificationsActiveIcon />}
              label="Okunmamış"
              onClick={() => handleFilterChange('unread')}
              color={filter === 'unread' ? 'primary' : 'default'}
              variant={filter === 'unread' ? 'filled' : 'outlined'}
              sx={{ 
                borderRadius: 2,
                background: filter === 'unread' ? 'rgba(255,0,0,0.1)' : undefined,
                color: filter === 'unread' ? '#FF0000' : undefined,
                '&:hover': {
                  backgroundColor: 'rgba(255,0,0,0.1)'
                }
              }}
            />
          </Stack>
        </Box>

        <AnimatePresence>
          {pagedNotifications.length > 0 ? (
            <>
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1, textAlign: 'center' }}>
                {pagedNotifications.length} / {filteredNotifications.length} bildirim gösteriliyor
              </Typography>
              <List sx={{ p: 0 }}>
                {pagedNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem
                      sx={{
                        ...getNotificationStyle(notification.type, notification.read),
                        mb: 2,
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: alpha(getNotificationColor(notification.type), 0.2),
                              color: getNotificationColor(notification.type)
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                {getNotificationMessage(notification)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
                                {notification.timestamp ? format(new Date(notification.timestamp), 'dd MMMM yyyy HH:mm', { locale: tr }) : ''}
                              </Typography>
                            </>
                          }
                        />
                      </Box>
                      <Tooltip title="Bildirimi sil">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(notification.id)}
                          sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1)
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </>
          ) : (
            <Fade in>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 2
                }}
              >
                <NotificationsIcon
                  sx={{
                    fontSize: 64,
                    color: 'text.disabled',
                    mb: 2
                  }}
                />
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                  Henüz bildiriminiz yok
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Favori takımlarınızın maçları veya önemli haberler için bildirimler burada görünecek.
                </Typography>
              </Box>
            </Fade>
          )}
        </AnimatePresence>
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <button
              style={{
                background: '#FF0000',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 24px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255,0,0,0.08)',
                transition: 'background 0.2s'
              }}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Daha Fazla Göster
            </button>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearAllNotifications}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(255,0,0,0.08)',
              textTransform: 'none',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(90deg, #ff1744 0%, #b71c1c 100%)' : 'linear-gradient(90deg, #ff5252 0%, #ff1744 100%)',
              color: '#fff',
              '&:hover': {
                background: theme.palette.mode === 'dark' ? 'linear-gradient(90deg, #b71c1c 0%, #ff1744 100%)' : 'linear-gradient(90deg, #ff1744 0%, #ff5252 100%)',
                boxShadow: '0 4px 16px rgba(255,0,0,0.15)'
              },
              mt: 1
            }}
            startIcon={<NotificationsOffIcon />}
          >
            Tüm Bildirimleri Temizle
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Notifications; 