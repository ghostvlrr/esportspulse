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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata oluştu:', error);
        setError('Bildirimler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
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
      setError(null);
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
      setError('Bildirim okundu olarak işaretlenirken bir hata oluştu.');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setError(null);
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Bildirim silinirken hata oluştu:', error);
      setError('Bildirim silinirken bir hata oluştu.');
    }
  };

  return {
    notifications,
    setNotifications,
    markAsRead,
    deleteNotification,
    error,
    loading
  };
}; 