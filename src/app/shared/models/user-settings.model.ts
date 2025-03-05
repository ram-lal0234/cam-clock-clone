export interface UserSettings {
  id: string;
  user_id: string;
  workspace_id: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  default_currency: string;
  default_hourly_rate?: number;
  notifications_enabled: boolean;
  email_notifications: boolean;
  desktop_notifications: boolean;
  created_at: string;
  updated_at: string;
} 