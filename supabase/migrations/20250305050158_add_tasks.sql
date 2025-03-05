-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  estimated_hours numeric,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tasks Policies
CREATE POLICY "Workspace members can read tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE p.id = tasks.project_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can manage tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE p.id = tasks.project_id
      AND wm.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);

-- Update time_entries table to reference tasks
ALTER TABLE time_entries
ADD COLUMN task_id uuid REFERENCES tasks(id) ON DELETE SET NULL;

-- Add index for task_id in time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id); 