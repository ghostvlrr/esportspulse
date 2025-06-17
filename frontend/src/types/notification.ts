export interface NotificationSettings {
  enabled: boolean;
  beforeMatch: number;
  matchStart: boolean;
  matchEnd: boolean;
  scoreUpdate: boolean;
}

export interface Notification {
  id: string;
  type: 'match' | 'news' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type NotificationType = 'matchStart' | 'scoreChange' | 'matchEnd' | 'news' | 'system' | 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
}

export interface NotificationPreferences {
  matchStart: boolean;
  scoreChange: boolean;
  matchEnd: boolean;
  news: boolean;
  system: boolean;
  email: boolean;
  push: boolean;
  inApp: boolean;
  matchUpdates: boolean;
  newsUpdates: boolean;
  systemUpdates: boolean;
} 