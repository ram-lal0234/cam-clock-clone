export interface Client {
  id: string;
  name: string;
  workspace_id: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  hourly_rate?: number;
  currency?: string;
  is_active: boolean;
} 