import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'match' | 'news' | 'event' | 'system';
  read: boolean;
  createdAt: string;
  data?: {
    matchId?: string;
    newsId?: string;
    eventId?: string;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private notifications: Notification[] = [];

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        this.notifications = JSON.parse(storedNotifications);
      }
      await this.fetchNotifications();
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    }
  }

  private async fetchNotifications() {
    try {
      const response = await apiService.get<Notification[]>('/notifications');
      if (!response.error) {
        this.notifications = response.data;
        await this.saveNotifications();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Bildirimler alınırken hata:', error);
    }
  }

  private async saveNotifications() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Bildirimler kaydedilirken hata:', error);
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const response = await apiService.put<{ success: boolean }>(`/notifications/${notificationId}/read`, {});
      if (!response.error && response.data.success) {
        this.notifications = this.notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        );
        await this.saveNotifications();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    }
  }

  async markAllAsRead() {
    try {
      const response = await apiService.put<{ success: boolean }>('/notifications/read-all', {});
      if (!response.error && response.data.success) {
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          read: true,
        }));
        await this.saveNotifications();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', error);
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      const response = await apiService.delete<{ success: boolean }>(`/notifications/${notificationId}`);
      if (!response.error && response.data.success) {
        this.notifications = this.notifications.filter((notification) => notification.id !== notificationId);
        await this.saveNotifications();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
    }
  }

  async clearAllNotifications() {
    try {
      const response = await apiService.delete<{ success: boolean }>('/notifications');
      if (!response.error && response.data.success) {
        this.notifications = [];
        await this.saveNotifications();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Tüm bildirimler silinirken hata:', error);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter((notification) => !notification.read).length;
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  addListener(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.notifications));
  }
}

export const notificationService = NotificationService.getInstance(); 