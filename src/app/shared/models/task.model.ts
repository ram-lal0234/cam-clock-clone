export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  assigned_to?: string;
  status: TaskStatus;
  priority: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  estimated_hours?: number;
  actual_hours?: number;
  parent_task_id?: string;
  is_subtask: boolean;
}