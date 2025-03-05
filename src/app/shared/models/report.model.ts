export type ReportType = 'time' | 'project' | 'client' | 'invoice';

export interface Report {
  id: string;
  workspace_id: string;
  name: string;
  type: ReportType;
  parameters: Record<string, any>;
  created_at: string;
  created_by: string;
  last_run_at?: string;
  schedule?: string; // cron expression
  is_scheduled: boolean;
} 