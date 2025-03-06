export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  avatar_url?: string;
  workspace_id?: string;
} 