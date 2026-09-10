'use client';

import React, { useState, useEffect } from 'react';
import { AvailableSlot, DayAvailabilityResult } from '../domain/reservation-availability';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

interface TableReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TableReservationModal({ isOpen, onClose }: TableReservationModalProps) {
  // Date setup (YYYY-MM-DD for today and tomorrow)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [availability, setAvailability] = useState<DayAvailabilityResult | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ resNumber: number; msg: string } | null>(null);

  useScrollLock(isOpen);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting]);

  // Fetch available slots whenever date changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setErrorMessage(null);
        setSelectedSlot('');

        const res = await fetch(`/api/reservations?date=${selectedDate}`);
        const data: DayAvailabilityResult = await res.json();

        if (isMounted) {
          setAvailability(data);
          // Pick first available slot by default
          const firstAvailable = data.slots?.find((s) => s.available);
          if (firstAvailable) {
            setSelectedSlot(firstAvailable.time);
          }
        }
      } catch (e) {
        if (isMounted) {
          setErrorMessage('تعذر جلب الأوقات المتاحة حالياً، يرجى المحاولة لاحقاً');
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }

    loadSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, isOpen]);

  // Reset state on close
  const handleClose = () => {
    setSuccessInfo(null);
    setErrorMessage(null);
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('يرجى كتابة الاسم');
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/\s+/g, '');
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
      setErrorMessage('يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 (11 رقماً)');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('يرجى اختيار موعد الحجز من الأوقات المتاحة');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: cleanPhone,
          guest_count: guestCount,
          reservation_date: selectedDate,
          reservation_time: selectedSlot,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'تعذر تأكيد الحجز');
        return;
      }

      setSuccessInfo({
        resNumber: data.reservation_number,
        msg: data.message,
      });
    } catch (e: any) {
      setErrorMessage('حدث خطأ في الاتصال، يرجى التأكد من اتصالك بالإنترنت');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 select-none dir-rtl animate-fade-in">
      {/* Backdrop with click to close */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={!submitting ? handleClose : undefined}
      />

      {/* Modal Content Box */}
      <div
        className="relative bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 my-auto text-right z-10 max-h-[92dvh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              مطعم ومسمط مصطفى الجزار
            </span>
            <h2 id="reservation-modal-title" className="text-xl font-black text-white mt-1">حجز طاولة</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="إغلاق النافذة"
          >
            ✕
          </button>
        </div>

        {/* Success Confirmation View */}
        {successInfo ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              ✅
            </div>
            <div>
              <span className="text-xs text-stone-400 font-bold block">رقم طلب الحجز</span>
              <span className="text-3xl font-black text-amber-400 tabular-nums">
                #{successInfo.resNumber}
              </span>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed max-w-sm mx-auto">
              {successInfo.msg}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-lg shadow-amber-500/10"
              >
                حسناً، العودة لقائمة الطعام
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold text-xs leading-relaxed flex items-start gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="font-bold text-stone-300 block mb-1.5">تاريخ الحجز:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`py-2.5 px-3 rounded-xl font-bold transition-all min-h-[44px] flex items-center justify-center ${
                    selectedDate === todayStr
                      ? 'bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/10'
                      : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  اليوم ({new Date().toLocaleDateString('ar-EG', { weekday: 'short', month: 'numeric', day: 'numeric' })})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(tomorrowStr)}
                  className={`py-2.5 px-3 rounded-xl font-bold transition-all min-h-[44px] flex items-center justify-center ${
                    selectedDate === tomorrowStr
                      ? 'bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/10'
                      : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  الغد ({tomorrow.toLocaleDateString('ar-EG', { weekday: 'short', month: 'numeric', day: 'numeric' })})
                </button>
              </div>
            </div>

            {/* Available Time Slots Grid */}
            <div>
              <label className="font-bold text-stone-300 flex items-center justify-between mb-1.5">
                <span>الموعد المطلوب (ساعات العمل المعتمدة):</span>
                {loadingSlots && <span className="text-[10px] text-amber-400 font-normal">جاري تحديث المواعيد...</span>}
              </label>

              {loadingSlots ? (
                <div className="py-6 text-center text-stone-500 text-[11px]">
                  جاري جلب أوقات الحجز المتاحة...
                </div>
              ) : availability && !availability.isOpen ? (
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-400 text-center text-xs">
                  {availability.reason || 'المطعم مغلق في هذا التاريخ'}
                </div>
              ) : availability && availability.slots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1.5 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  {availability.slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-2 px-2.5 rounded-xl text-center text-xs font-bold transition-all min-h-[40px] flex items-center justify-center ${
                        !slot.available
                          ? 'opacity-30 cursor-not-allowed bg-stone-900 text-stone-600'
                          : selectedSlot === slot.time
                          ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                          : 'bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-800'
                      }`}
                      title={slot.reason || slot.displayTime}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-stone-500 text-xs">
                  لا توجد فترات حجز متاحة في هذا اليوم.
                </div>
              )}
            </div>

            {/* Guest Count */}
            <div>
              <label className="font-bold text-stone-300 block mb-1.5">عدد الأفراد (الضيوف):</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                {[2, 4, 6, 8, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuestCount(num)}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs shrink-0 transition-all min-h-[40px] flex items-center justify-center ${
                      guestCount === num
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {num} أفراد
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-300 block mb-1">الاسم الكريم:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="الاسم بالكامل"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">رقم الهاتف للتأكيد:</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-mono min-h-[44px]"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="font-bold text-stone-300 block mb-1">ملاحظات خاصة (اختياري):</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: تجهيز طاولة عائلية، عيد ميلاد..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm transition-all disabled:opacity-50 shadow-lg shadow-amber-500/10 min-h-[48px] flex items-center justify-center active:scale-[0.98]"
              >
                {submitting ? 'جاري إرسال الطلب...' : 'تأكيد إرسال طلب الحجز'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs sm:text-sm transition-colors min-h-[48px] flex items-center justify-center active:scale-[0.98]"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
