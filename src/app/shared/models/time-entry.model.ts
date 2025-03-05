export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  is_billable: boolean;
  hourly_rate?: number;
  currency?: string;
  // Computed properties for compatibility
  startTime?: Date;
  endTime?: Date;
  isRunning?: boolean;
  projectId?: string;
}