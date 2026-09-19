import { supabase } from '@/lib/supabase/client';

export interface AvailableSlot {
  time: string;        // "HH:mm" 24-hour format e.g. "17:30"
  displayTime: string; // Arabic display e.g. "05:30 م"
  available: boolean;
  reason?: string;
}

export interface DayAvailabilityResult {
  isOpen: boolean;
  reason?: string;
  openTime?: string;
  closeTime?: string;
  slots: AvailableSlot[];
}

const DEFAULT_MAX_TABLES_PER_SLOT = 6; // Max concurrent reservations per 30-min window (matching create_reservation_secure RPC)

/**
 * Formats a 24h time string (e.g. "15:30") to Arabic 12h display (e.g. "03:30 م")
 */
export function formatArabicTime(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'م' : 'ص';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  const padH = h < 10 ? `0${h}` : `${h}`;
  return `${padH}:${m} ${period}`;
}

/**
 * Calculates authoritative reservation availability for a given calendar date
 * Evaluates: Operating Hours + Special Closures + Schedule Overrides + Existing Reservations
 */
export async function getReservationAvailability(dateStr: string): Promise<DayAvailabilityResult> {
  const targetDate = new Date(`${dateStr}T00:00:00`);
  if (isNaN(targetDate.getTime())) {
    return { isOpen: false, reason: 'تاريخ غير صالح', slots: [] };
  }

  // 1. Check Date Range (Today only)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (targetDate.getTime() !== today.getTime()) {
    if (targetDate < today) {
      return { isOpen: false, reason: 'لا يمكن اختيار تاريخ في الماضي', slots: [] };
    }
    return { isOpen: false, reason: 'الحجز متاح لليوم الحالي فقط لضمان دقة وتأكيد مواعيد الصالة', slots: [] };
  }

  // 2. Check Special Closures
  const { data: closure } = await supabase
    .from('restaurant_special_closures')
    .select('*')
    .eq('closure_date', dateStr)
    .maybeSingle();

  if (closure) {
    return {
      isOpen: false,
      reason: closure.reason || 'المطعم مغلق لعطلة أو مناسبة استثنائية في هذا اليوم',
      slots: [],
    };
  }

  // 3. Check Schedule Overrides
  const { data: override } = await supabase
    .from('restaurant_schedule_overrides')
    .select('*')
    .eq('override_date', dateStr)
    .maybeSingle();

  if (override && override.is_closed) {
    return {
      isOpen: false,
      reason: override.reason || 'تم إغلاق المطعم بموجب جدول تشغيل استثنائي لهذا اليوم',
      slots: [],
    };
  }

  // 4. Fetch Base Operating Hours (day_of_week 0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = targetDate.getDay();
  const { data: baseHours, error: hoursErr } = await supabase
    .from('restaurant_operating_hours')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (hoursErr || !baseHours) {
    return { isOpen: false, reason: 'تعذر جلب ساعات العمل المعتمدة للمطعم', slots: [] };
  }

  if (baseHours.is_closed && (!override || override.is_closed)) {
    return { isOpen: false, reason: 'المطعم في عطلة أسبوعية في هذا اليوم', slots: [] };
  }

  // Determine effective open and close times
  const effectiveOpen = (override?.open_time || baseHours.open_time || '15:00:00').slice(0, 5);
  const effectiveClose = (override?.close_time || baseHours.close_time || '03:00:00').slice(0, 5);

  // 5. Generate 30-minute intervals
  const slots: AvailableSlot[] = [];
  const [openH, openM] = effectiveOpen.split(':').map(Number);
  const [closeH, closeM] = effectiveClose.split(':').map(Number);

  let startMinutes = openH * 60 + openM;
  let endMinutes = closeH * 60 + closeM;

  // Handle overnight range (e.g. 15:00 to 03:00 next day)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  // Subtract 60 minutes before closing for kitchen last-order boundary
  const lastReservationMinute = Math.max(startMinutes, endMinutes - 60);

  for (let m = startMinutes; m <= lastReservationMinute; m += 30) {
    const normH = Math.floor(m / 60) % 24;
    const normM = m % 60;
    const time24 = `${normH < 10 ? '0' + normH : normH}:${normM < 10 ? '0' + normM : normM}`;

    slots.push({
      time: time24,
      displayTime: formatArabicTime(time24),
      available: true,
    });
  }

  // 6. Fetch Existing Active Reservations for Capacity Check
  const { data: existingReservations } = await supabase
    .from('reservations')
    .select('reservation_time, guest_count')
    .eq('reservation_date', dateStr)
    .in('status', ['pending', 'confirmed']);

  const reservationsPerSlot = new Map<string, number>();
  if (existingReservations) {
    for (const res of existingReservations) {
      const slotTime = (res.reservation_time || '').slice(0, 5);
      const count = (reservationsPerSlot.get(slotTime) || 0) + 1;
      reservationsPerSlot.set(slotTime, count);
    }
  }

  // 7. Filter and Mark Capacity Availability
  const isToday = targetDate.toDateString() === today.toDateString();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const finalSlots = slots.map((slot) => {
    const [h, min] = slot.time.split(':').map(Number);
    let slotTotalMin = h * 60 + min;

    // Adjust for overnight slots past midnight
    if (slotTotalMin < startMinutes && endMinutes > 24 * 60) {
      slotTotalMin += 24 * 60;
    }

    // Past time check for Today (require at least 45 minutes lead time)
    if (isToday) {
      if (slotTotalMin <= currentTotalMinutes + 45) {
        return { ...slot, available: false, reason: 'انتهت فترة الحجز لهذا التوقيت' };
      }
    }

    // Capacity limit check
    const bookedCount = reservationsPerSlot.get(slot.time) || 0;
    if (bookedCount >= DEFAULT_MAX_TABLES_PER_SLOT) {
      return { ...slot, available: false, reason: 'اكتمل حجز الطاولات في هذا التوقيت' };
    }

    return slot;
  });

  return {
    isOpen: true,
    openTime: effectiveOpen,
    closeTime: effectiveClose,
    slots: finalSlots,
  };
}
