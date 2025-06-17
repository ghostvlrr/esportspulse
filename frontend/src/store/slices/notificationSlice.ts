import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'matchStart' | 'scoreChange' | 'matchEnd' | 'news' | 'system';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  matchUpdates: boolean;
  newsUpdates: boolean;
  systemUpdates: boolean;
  matchStart: boolean;
  scoreChange: boolean;
  matchEnd: boolean;
  news: boolean;
  system: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences;
  userId: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  preferences: {
    email: true,
    push: true,
    inApp: true,
    matchUpdates: true,
    newsUpdates: true,
    systemUpdates: true,
    matchStart: true,
    scoreChange: true,
    matchEnd: true,
    news: true,
    system: true
  },
  userId: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    updatePreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.preferences = action.payload;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    }
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setNotifications,
  updatePreferences,
  setUserId
} = notificationSlice.actions;

export default notificationSlice.reducer; 