/*
  # Initial Schema Setup for TimeTracker

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `display_name` (text)
      - `created_at` (timestamp)
      - `last_login` (timestamp)
      - `workspace_id` (uuid, nullable)

    - `workspaces`
      - `id` (uuid, primary key)
      - `name` (text)
      - `owner_id` (uuid)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `workspace_members`
      - `workspace_id` (uuid)
      - `user_id` (uuid)
      - `role` (text)
      - `joined_at` (timestamp)

    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `color` (text)
      - `workspace_id` (uuid)
      - `is_archived` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `time_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `project_id` (uuid, nullable)
      - `description` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp, nullable)
      - `duration` (integer, nullable)
      - `is_running` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now(),
  workspace_id uuid
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#3b82f6',
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer,
  is_running boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Workspaces Policies
CREATE POLICY "Workspace members can read workspace"
  ON workspaces
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owner can update workspace"
  ON workspaces
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Workspace Members Policies
CREATE POLICY "Members can read workspace members"
  ON workspace_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can manage workspace members"
  ON workspace_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Projects Policies
CREATE POLICY "Workspace members can read projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = projects.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can manage projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = projects.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Time Entries Policies
CREATE POLICY "Users can read own time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);