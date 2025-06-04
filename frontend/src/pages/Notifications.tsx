import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { markAsRead, removeNotification, NotificationItem } from '../store/slices/notificationSlice';
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
  Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setFilteredNotifications(notifications);
  }, [notifications]);

  const handleDelete = (id: string) => {
    dispatch(removeNotification(id));
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
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
    if (newFilter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(n => !n.read));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
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
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
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
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            />
          </Stack>
        </Box>

        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification) => (
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
                      p: 2
                    }}
                  >
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
                            {format(notification.timestamp, 'dd MMMM yyyy HH:mm', { locale: tr })}
                          </Typography>
                        </>
                      }
                    />
                    <Stack direction="row" spacing={1}>
                      {!notification.read && (
                        <Tooltip title="Okundu olarak işaretle">
                          <IconButton
                            size="small"
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{
                              color: theme.palette.success.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.1)
                              }
                            }}
                          >
                            <DoneAllIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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
                    </Stack>
                  </ListItem>
                </motion.div>
              ))}
            </List>
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
      </Paper>
    </Container>
  );
};

export default Notifications; 