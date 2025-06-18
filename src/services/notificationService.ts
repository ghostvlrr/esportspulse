import { store } from '../store';
import { addNotification, updatePreferences, NotificationPreferences, NotificationItem } from '../store/slices/notificationSlice';
import { toast } from 'react-toastify';
import { api } from './api';

export class NotificationService {
  public async updatePreferences(preferences: NotificationPreferences) {
    try {
      const response = await api.put('/notifications/preferences', { preferences });
      return response.data;
    } catch (error) {
      console.error('Bildirim tercihleri güncellenirken hata:', error);
      throw error;
    }
  }

  public async sendNotification(notification: NotificationItem, userId: string) {
    try {
      const response = await api.post('/notifications/send', { notification, userId });
      return response.data;
    } catch (error) {
      console.error('Bildirim gönderilirken hata:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService(); 