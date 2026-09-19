export type ShiftStatus = 'open' | 'closed';

export interface DailyShift {
  id: string;
  shift_number: number;
  opened_by: string;
  opened_at: string;
  initial_cash: number;
  status: ShiftStatus;
  closed_by?: string | null;
  closed_at?: string | null;
  final_cash?: number | null;
  system_expected_cash?: number | null;
  discrepancy?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface ShiftExpense {
  id: string;
  shift_id: string;
  category: string;
  amount: number;
  description: string;
  recipient_name?: string | null;
  recorded_by: string;
  created_at: string;
}

export interface OpenShiftRequest {
  opened_by: string;
  initial_cash: number;
}

export interface CloseShiftRequest {
  shift_id: string;
  closed_by: string;
  final_cash: number;
  notes?: string;
}

export interface ShiftReconciliationResult {
  shift_id: string;
  shift_number: number;
  opened_by: string;
  closed_by: string;
  opened_at: string;
  closed_at: string;
  initial_cash: number;
  cash_sales_total: number;
  cash_orders_count: number;
  expenses_total: number;
  expenses_count: number;
  system_expected_cash: number;
  final_cash: number;
  discrepancy: number;
}

export interface ActiveShiftApiResponse {
  success: boolean;
  shift: DailyShift | null;
  error?: string;
  code?: string;
}

export interface CloseShiftApiResponse {
  success: boolean;
  shift?: DailyShift;
  reconciliation?: ShiftReconciliationResult;
  error?: string;
  code?: string;
}
