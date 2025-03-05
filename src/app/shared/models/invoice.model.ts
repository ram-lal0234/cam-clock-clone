export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  workspace_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  created_by: string;
} 