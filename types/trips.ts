export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  active_shift_id?: string;
  current_trip_id?: string;
  current_orders_count: number;
  total_delivered_today: number;
  total_cash_collected: number;
}

export type TripStatus = 'draft' | 'assigned' | 'active' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  driver_id: string;
  shift_id: string;
  status: TripStatus;
  order_ids: string[];
  max_orders: 5;
  departed_at?: string;
  returned_at?: string;
  notes?: string;
}

export interface Shift {
  id: string;
  opened_at: string;
  closed_at?: string;
  opened_by: string;
  closed_by?: string;
  total_orders_count: number;
  total_revenue: number;
  total_cash_expected: number;
  total_cash_received?: number;
  discrepancy?: number;
  status: 'open' | 'closed';
}
