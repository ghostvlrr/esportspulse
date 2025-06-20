import { store } from '../store';
import { addNotification, updatePreferences, NotificationPreferences, NotificationItem } from '../store/slices/notificationSlice';
import { toast } from 'react-toastify';
import { api } from './api';
import type { Notification } from '../types/notification';

// UUID üretici
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getAnonUserId() {
  let anonUserId = localStorage.getItem('anonUserId');
  if (!anonUserId) {
    anonUserId = generateUUID();
    localStorage.setItem('anonUserId', anonUserId);
  }
  return anonUserId;
}

// Bildirim sesi ve web notification fonksiyonları
function playNotificationSound() {
  const audio = new Audio('/notification.mp3');
  audio.play();
}

function showWebNotification(title: string, options: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

export class NotificationService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 5000;
  private static readonly STORAGE_KEY = 'notificationPreferences';
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  constructor() {
    this.initializeWebSocket();
    this.loadPreferences();
  }

  private async loadPreferences() {
    try {
      const anonUserId = getAnonUserId();
      // Önce localStorage'dan tercihleri yükle
      const savedPreferences = localStorage.getItem(NotificationService.STORAGE_KEY);
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        store.dispatch(updatePreferences(parsedPreferences));
      }
      // Backend'den de çek
      const response = await api.get(`/notifications/preferences/${anonUserId}`);
      if (response.data && response.data.preferences) {
        store.dispatch(updatePreferences(response.data.preferences));
        localStorage.setItem(NotificationService.STORAGE_KEY, JSON.stringify(response.data.preferences));
      }
    } catch (error) {
      console.error('Bildirim tercihleri yüklenirken hata:', error);
      // Varsayılan tercihleri kullan
      const defaultPreferences = store.getState().notifications.preferences;
      store.dispatch(updatePreferences(defaultPreferences));
      localStorage.setItem(NotificationService.STORAGE_KEY, JSON.stringify(defaultPreferences));
    }
  }

  private initializeWebSocket() {
    const userId = store.getState().notifications.userId || getAnonUserId();
    if (!userId) {
      console.log('Kullanıcı ID bulunamadı, WebSocket bağlantısı kurulmayacak');
      return;
    }

    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';
      this.socket = new WebSocket(`${wsUrl}/notifications?userId=${userId}`);

      this.socket.onopen = () => {
        console.log('WebSocket bağlantısı kuruldu');
        this.reconnectAttempts = 0;
        
        // Mevcut tercihleri WebSocket üzerinden gönder
        const preferences = store.getState().notifications.preferences;
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            type: 'preferences',
            preferences
          }));
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as NotificationItem;
          // Bildirim tercihlerini kontrol et
          const preferences = store.getState().notifications.preferences;
          const notificationType = notification.type as keyof NotificationPreferences;
          
          if (preferences[notificationType]) {
            store.dispatch(addNotification(notification));
            toast.info(notification.message, {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            if ((notification.type as string) === 'scoreUpdate' || (notification.type as string) === 'scoreChange') {
              playNotificationSound();
              showWebNotification('Skor Değişti!', {
                body: notification.message,
                icon: '/notification-icon.png'
              });
            }
          }
        } catch (error) {
          console.error('Bildirim işlenirken hata oluştu:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket bağlantısı kapandı');
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket hatası:', error);
      };
    } catch (error) {
      console.error('WebSocket bağlantısı kurulurken hata:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.initializeWebSocket(), this.reconnectTimeout);
    } else {
      console.error('Maksimum yeniden bağlanma denemesi aşıldı');
    }
  }

  public async updatePreferences(preferences: NotificationPreferences) {
    try {
      const anonUserId = getAnonUserId();
      // Backend'e tercihleri gönder
      await api.put('/notifications/preferences', { anonUserId, preferences });
      
      // Redux store'u güncelle
      store.dispatch(updatePreferences(preferences));
      
      // WebSocket üzerinden tercihleri gönder
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'preferences',
          preferences
        }));
      }

      // Tercihleri localStorage'a kaydet
      localStorage.setItem(NotificationService.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Bildirim tercihleri güncellenirken hata:', error);
      toast.error('Bildirim tercihleri güncellenirken bir hata oluştu');
    }
  }

  public async getNotificationHistory() {
    try {
      const anonUserId = getAnonUserId();
      const response = await api.get(`/notifications/history/${anonUserId}`);
      return response.data;
    } catch (error) {
      console.error('Bildirim geçmişi alınırken hata:', error);
      return [];
    }
  }

  public async markAsRead(notificationId: string) {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          return []; // Bildirimler bulunamadıysa boş dizi döndür
        }
        throw new Error(`Bildirimler alınamadı: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Bildirimler alınırken hata:', error);
      return []; // Hata durumunda boş dizi döndür
    }
  }
}

export const notificationService = new NotificationService(); 