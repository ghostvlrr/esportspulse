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