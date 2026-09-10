export interface Driver {
  id: string;
  name: string;
  phone?: string | null;
  status: 'available' | 'busy' | 'offline';
  is_active?: boolean;
  active_trips_count?: number;
}

export type TripStatus = 'created' | 'picked_up' | 'out_for_delivery' | 'completed' | 'cancelled';

export interface DeliveryTrip {
  id: string;
  trip_number?: number;
  driver_id: string;
  shift_id: string;
  status: TripStatus;
  expected_amount?: number;
  collected_amount?: number;
  collection_status?: string;
  created_at: string;
  completed_at?: string | null;
}

// Backward-compatible aliases
export type Trip = DeliveryTrip;

export interface Shift {
  id: string;
  driver_id: string;
  started_at: string;
  ended_at?: string | null;
  status: 'open' | 'closed';
  created_at: string;
}
