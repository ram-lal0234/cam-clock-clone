-- Enable RLS
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Policy for selecting workspace members
CREATE POLICY "Users can view members of their workspaces"
ON workspace_members FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Policy for inserting workspace members
CREATE POLICY "Users can add members to their workspaces"
ON workspace_members FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for updating workspace members
CREATE POLICY "Users can update members in their workspaces"
ON workspace_members FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for deleting workspace members
CREATE POLICY "Users can remove members from their workspaces"
ON workspace_members FOR DELETE
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
); 