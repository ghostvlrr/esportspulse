import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'match_start' | 'score_change' | 'match_end';
  matchId?: string;
  teamId?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata oluştu:', error);
      }
    };

    fetchNotifications();

    // WebSocket bağlantısı için event listener
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      setNotifications(prev => [event.detail, ...prev]);
    };

    window.addEventListener('newNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata oluştu:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Bildirim silinirken hata oluştu:', error);
    }
  };

  return {
    notifications,
    setNotifications,
    markAsRead,
    deleteNotification
  };
}; 