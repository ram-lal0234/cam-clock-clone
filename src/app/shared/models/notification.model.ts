export type NotificationType = 'task_assigned' | 'task_completed' | 'time_entry_added' | 'invoice_sent' | 'invoice_paid' | 'report_ready';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: Record<string, any>;
} 