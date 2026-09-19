export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface CreateReservationPayload {
  customer_name: string;
  customer_phone: string;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:mm
  guest_count: number;     // 1 - 30
  notes?: string;
  deposit_amount?: number;
  deposit_receipt_url?: string;
  deposit_payment_method?: 'instapay' | 'wallet';
  deposit_sender_phone?: string;
  turnstile_token?: string;
}

export interface ReservationPaymentAccounts {
  instapay?: {
    identifier: string;
    account_name: string;
    note?: string;
  };
  wallet?: {
    identifier: string;
    account_name: string;
    note?: string;
  };
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  distance_km?: number;
}

export interface ReservationSubmissionResult {
  success: boolean;
  reservation_number?: number;
  message: string;
  error?: string;
}

export interface CustomerReservationStatus {
  reservation_number: number;
  status: ReservationStatus;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  deposit_amount?: number | null;
  created_at?: string;
  updated_at?: string;
}

export const RESERVATION_STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; icon: string; color: string; bgColor: string; borderColor: string }
> = {
  pending: {
    label: 'قيد المراجعة والتأكيد',
    icon: '⏳',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  confirmed: {
    label: 'تم تأكيد الحجز',
    icon: '✅',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  completed: {
    label: 'اكتمل الحجز بنجاح',
    icon: '🎉',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  cancelled: {
    label: 'تم إلغاء الحجز',
    icon: '❌',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  no_show: {
    label: 'لم يحضر',
    icon: '⚠️',
    color: 'text-stone-400',
    bgColor: 'bg-stone-500/10',
    borderColor: 'border-stone-500/30',
  },
};
