import React from 'react';
import { 
  Badge, 
  IconButton, 
  Menu, 
  Typography, 
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'matchStart' | 'scoreUpdate' | 'matchEnd' | 'news' | 'system';
}

interface NotificationProps {
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
  onMarkAllAsRead: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  notifications,
  onNotificationClick,
  onMarkAllAsRead
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'matchStart':
        return '🎮';
      case 'scoreUpdate':
        return '🎯';
      case 'matchEnd':
        return '🏆';
      default:
        return '📢';
    }
  };

  const getNotificationStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'matchStart':
        return { 
          backgroundColor: 'rgba(220, 38, 38, 0.05)',
          borderLeft: '3px solid #DC2626'
        };
      case 'scoreUpdate':
        return { 
          backgroundColor: 'rgba(185, 28, 28, 0.05)',
          borderLeft: '3px solid #B91C1C'
        };
      case 'matchEnd':
        return { 
          backgroundColor: 'rgba(153, 27, 27, 0.05)',
          borderLeft: '3px solid #991B1B'
        };
      default:
        return { 
          backgroundColor: 'rgba(127, 29, 29, 0.05)',
          borderLeft: '3px solid #7F1D1D'
        };
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          ml: 1,
          color: 'rgba(220, 38, 38, 0.7)',
          '&:hover': {
            color: '#DC2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              boxShadow: '0px 0px 8px rgba(220, 38, 38, 0.5)',
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            background: 'linear-gradient(145deg, #0A0A0A 0%, #171717 100%)',
            color: '#fff',
            border: '1px solid rgba(220, 38, 38, 0.1)',
            boxShadow: '0px 8px 24px rgba(220, 38, 38, 0.2)',
            '& .MuiListItem-root:hover': {
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              transition: 'all 0.3s ease'
            }
          }
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(220, 38, 38, 0.1)'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#FFFFFF',
              textShadow: '0px 0px 8px rgba(220, 38, 38, 0.3)'
            }}
          >
            Bildirimlerin
          </Typography>
          {unreadCount > 0 && (
            <Typography
              variant="body2"
              sx={{ 
                color: '#DC2626',
                cursor: 'pointer',
                textShadow: '0px 0px 8px rgba(220, 38, 38, 0.3)',
                '&:hover': { 
                  color: '#FFFFFF',
                  textShadow: '0px 0px 12px rgba(220, 38, 38, 0.5)'
                }
              }}
              onClick={onMarkAllAsRead}
            >
              Tümünü Okundu İşaretle
            </Typography>
          )}
        </Box>
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Henüz bildirimin yok"
                secondary="Favori takımlarının maçlarını takip etmeye başla! 🎮"
                sx={{ 
                  textAlign: 'center',
                  '& .MuiListItemText-primary': { 
                    color: '#FFFFFF',
                    textShadow: '0px 0px 8px rgba(220, 38, 38, 0.3)'
                  },
                  '& .MuiListItemText-secondary': { 
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }}
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => {
                  onNotificationClick(notification);
                  handleClose();
                }}
                sx={{
                  ...getNotificationStyle(notification.type),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.1)',
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    fontSize: '1.2rem',
                    boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.1)'
                  }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          display: 'block',
                          mb: 0.5,
                          textShadow: '0px 0px 8px rgba(220, 38, 38, 0.2)'
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ 
                          color: 'rgba(220, 38, 38, 0.7)',
                          textShadow: '0px 0px 8px rgba(220, 38, 38, 0.2)'
                        }}
                      >
                        {format(notification.timestamp, 'd MMMM HH:mm', { locale: tr })}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </>
  );
};

export default Notification; 