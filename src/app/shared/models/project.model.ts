export type ProjectStatus = 'active' | 'archived' | 'deleted';

export interface Project {
  id: string;
  name: string;
  workspace_id: string;
  color: string;
  status: ProjectStatus;
  description?: string;
  created_at: string;
  updated_at: string;
  estimated_hours?: number;
  hourly_rate?: number;
}