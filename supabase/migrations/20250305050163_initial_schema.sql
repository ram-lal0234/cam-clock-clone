-- Drop existing tables if they exist
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS project_clients CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;

-- Create enum types
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_completed', 'project_created', 'project_archived', 'invoice_sent', 'invoice_paid');
CREATE TYPE report_type AS ENUM ('summary', 'daily', 'weekly', 'monthly', 'project');

-- Create user_profiles table to store additional user information
CREATE TABLE user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    profile_image text,
    timezone text DEFAULT 'UTC',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create workspaces table
CREATE TABLE workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    is_personal boolean DEFAULT false,
    hourly_rate numeric,
    currency text DEFAULT 'USD',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    description text,
    color text NOT NULL DEFAULT '#3b82f6',
    status project_status NOT NULL DEFAULT 'active',
    is_archived boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL DEFAULT '',
    description text,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to uuid REFERENCES auth.users(id),
    status task_status NOT NULL DEFAULT 'todo',
    priority integer DEFAULT 0,
    due_date timestamptz,
    estimated_hours numeric,
    actual_hours numeric,
    parent_task_id uuid REFERENCES tasks(id),
    is_subtask boolean DEFAULT false,
    is_completed boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create time_entries table
CREATE TABLE time_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
    description text,
    start_time timestamptz NOT NULL,
    end_time timestamptz,
    duration integer,
    is_running boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE workspace_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    joined_at timestamptz DEFAULT now(),
    UNIQUE(workspace_id, user_id)
);

-- Create tags table
CREATE TABLE tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color text NOT NULL,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id)
);

-- Create task_tags table
CREATE TABLE task_tags (
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (task_id, tag_id)
);

-- Create clients table
CREATE TABLE clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email text,
    phone text,
    address text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    hourly_rate numeric,
    currency text DEFAULT 'USD',
    is_active boolean DEFAULT true
);

-- Create project_clients table
CREATE TABLE project_clients (
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (project_id, client_id)
);

-- Create invoices table
CREATE TABLE invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES clients(id),
    invoice_number text NOT NULL UNIQUE,
    status invoice_status NOT NULL DEFAULT 'draft',
    issue_date timestamptz NOT NULL,
    due_date timestamptz NOT NULL,
    subtotal numeric NOT NULL,
    tax_rate numeric,
    tax_amount numeric,
    total numeric NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    paid_at timestamptz,
    created_by uuid NOT NULL REFERENCES auth.users(id)
);

-- Create invoice_items table
CREATE TABLE invoice_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description text NOT NULL,
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    amount numeric NOT NULL,
    time_entry_ids uuid[],
    created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name text NOT NULL,
    type report_type NOT NULL,
    parameters jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    last_run_at timestamptz,
    schedule text,
    is_scheduled boolean DEFAULT false
);

-- Create notifications table
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    data jsonb
);

-- Create user_settings table
CREATE TABLE user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    timezone text NOT NULL DEFAULT 'UTC',
    date_format text NOT NULL DEFAULT 'MM/DD/YYYY',
    time_format text NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
    default_currency text NOT NULL DEFAULT 'USD',
    default_hourly_rate numeric,
    notifications_enabled boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    desktop_notifications boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, workspace_id)
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    details jsonb,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspaces
CREATE POLICY "Users can read their own workspaces"
    ON workspaces FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Users can manage their own workspaces"
    ON workspaces FOR ALL
    TO authenticated
    USING (owner_id = auth.uid());

-- Create RLS policies for projects
CREATE POLICY "Workspace members can read projects"
    ON projects FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = projects.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage projects"
    ON projects FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = projects.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for tasks
CREATE POLICY "Workspace members can read tasks"
    ON tasks FOR SELECT
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
    ON tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
            WHERE p.id = tasks.project_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for time_entries
CREATE POLICY "Users can read their own time entries"
    ON time_entries FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own time entries"
    ON time_entries FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Create RLS policies for workspace_members
CREATE POLICY "Workspace members can read workspace members"
    ON workspace_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace admins can manage members"
    ON workspace_members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin')
        )
    );

-- Create RLS policies for tags
CREATE POLICY "Workspace members can read tags"
    ON tags FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = tags.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage tags"
    ON tags FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = tags.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for task_tags
CREATE POLICY "Workspace members can read task tags"
    ON task_tags FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
            WHERE t.id = task_tags.task_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage task tags"
    ON task_tags FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
            WHERE t.id = task_tags.task_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for clients
CREATE POLICY "Workspace members can read clients"
    ON clients FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = clients.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage clients"
    ON clients FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = clients.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for project_clients
CREATE POLICY "Workspace members can read project clients"
    ON project_clients FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
            WHERE p.id = project_clients.project_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage project clients"
    ON project_clients FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
            WHERE p.id = project_clients.project_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for invoices
CREATE POLICY "Workspace members can read invoices"
    ON invoices FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = invoices.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage invoices"
    ON invoices FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = invoices.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for invoice_items
CREATE POLICY "Workspace members can read invoice items"
    ON invoice_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            JOIN workspace_members wm ON i.workspace_id = wm.workspace_id
            WHERE i.id = invoice_items.invoice_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage invoice items"
    ON invoice_items FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            JOIN workspace_members wm ON i.workspace_id = wm.workspace_id
            WHERE i.id = invoice_items.invoice_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for reports
CREATE POLICY "Workspace members can read reports"
    ON reports FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = reports.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage reports"
    ON reports FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = reports.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for notifications
CREATE POLICY "Users can read their own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own notifications"
    ON notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Create RLS policies for user_settings
CREATE POLICY "Users can read their own settings"
    ON user_settings FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own settings"
    ON user_settings FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Create RLS policies for activity_logs
CREATE POLICY "Workspace members can read activity logs"
    ON activity_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = activity_logs.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

-- Create RLS policies for user_profiles
CREATE POLICY "Users can read their own profile"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX idx_tags_workspace_id ON tags(workspace_id);
CREATE INDEX idx_clients_workspace_id ON clients(workspace_id);
CREATE INDEX idx_invoices_workspace_id ON invoices(workspace_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_logs_workspace_id ON activity_logs(workspace_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, timezone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'timezone', 'UTC')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 