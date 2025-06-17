import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationItem, NotificationPreferences } from '../../types/notification';

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
    matchStart: true,
    scoreChange: true,
    matchEnd: true,
    news: true,
    system: true,
    email: true,
    push: true,
    inApp: true,
    matchUpdates: true,
    newsUpdates: true,
    systemUpdates: true,
  },
  userId: null,
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
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    updatePreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  updatePreferences,
  setUserId,
} = notificationSlice.actions;

export default notificationSlice.reducer; 