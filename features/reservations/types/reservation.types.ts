export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface CreateReservationPayload {
  customer_name: string;
  customer_phone: string;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:mm
  guest_count: number;     // 1 - 30
  notes?: string;
  turnstile_token?: string;
}

export interface ReservationSubmissionResult {
  success: boolean;
  reservation_number?: number;
  message: string;
  error?: string;
}
