export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  display_name?: string; // Computed property: first_name + last_name
  workspace_id?: string; // For backward compatibility
}