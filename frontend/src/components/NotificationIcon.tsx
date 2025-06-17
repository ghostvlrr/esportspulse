import React from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NotificationItem } from '../types/notification';

const NotificationIcon: React.FC = () => {
  const navigate = useNavigate();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const unreadCount = notifications.filter((n: NotificationItem) => !n.read).length;

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <Tooltip title="Bildirimler">
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#f44336',
              color: 'white',
              fontSize: '0.75rem',
              height: '20px',
              minWidth: '20px',
              padding: '0 6px',
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationIcon; 