'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DayAvailabilityResult } from '../domain/reservation-availability';
import {
  ReservationStatus,
  CustomerReservationStatus,
  ReservationPaymentAccounts,
  RESERVATION_STATUS_CONFIG,
} from '../types/reservation.types';
import { useScrollLock } from '@/lib/hooks/useScrollLock';
import {
  Upload,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  CreditCard,
  Smartphone,
  Calendar,
  Search,
  X,
} from 'lucide-react';

interface TableReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'create' | 'inquiry';
}

const DEFAULT_ACCOUNTS: ReservationPaymentAccounts = {
  instapay: {
    identifier: 'elgzar@instapay',
    account_name: 'Mostafa Elgzar',
    note: 'تحويل عبر تطبيق إنستاباي لعنوان الدفع اللحظي',
  },
  wallet: {
    identifier: '01026131499',
    account_name: 'محفظة كاش',
    note: 'فودافون كاش / أورانج كاش / اتصالات كاش / وي باي',
  },
};

export function TableReservationModal({
  isOpen,
  onClose,
  initialMode = 'create',
}: TableReservationModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'inquiry'>(initialMode);

  // --- Create Mode State (Same-Day Only) ---
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // --- Arabon / Deposit Payment State ---
  const [paymentAccounts, setPaymentAccounts] = useState<ReservationPaymentAccounts>(DEFAULT_ACCOUNTS);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'instapay' | 'wallet'>('instapay');
  const [depositSenderPhone, setDepositSenderPhone] = useState<string>('');
  const [isSenderPhoneManual, setIsSenderPhoneManual] = useState<boolean>(false);
  const [depositReceiptUrl, setDepositReceiptUrl] = useState<string>('');
  const [depositReceiptPreview, setDepositReceiptPreview] = useState<string>('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedIdentifier, setCopiedIdentifier] = useState<boolean>(false);

  const [availability, setAvailability] = useState<DayAvailabilityResult | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ resNumber: number; msg: string; depositAmount: number } | null>(null);

  // --- Inquiry Mode State ---
  const [inquiryResNum, setInquiryResNum] = useState<string>('');
  const [inquiryPhone, setInquiryPhone] = useState<string>('');
  const [inquiryLoading, setInquiryLoading] = useState<boolean>(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquiryResult, setInquiryResult] = useState<CustomerReservationStatus | null>(null);

  useScrollLock(isOpen);

  // Calculate deposit dynamically based on guests: 1-3 = 100, 4-6 = 200, etc.
  const depositAmount = Math.ceil(guestCount / 3) * 100;

  // Sync sender phone if user hasn't typed a custom sender phone
  const handleCustomerPhoneChange = (val: string) => {
    setCustomerPhone(val);
    if (!isSenderPhoneManual) {
      setDepositSenderPhone(val);
    }
  };

  const handleSenderPhoneChange = (val: string) => {
    setIsSenderPhoneManual(true);
    setDepositSenderPhone(val);
  };

  // Fetch Payment Accounts from Supabase Source of Truth
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadPaymentAccounts() {
      try {
        const { data, error } = await supabase
          .from('restaurant_policies')
          .select('value')
          .eq('key', 'reservation_payment_accounts')
          .single();

        if (isMounted && data?.value && !error) {
          setPaymentAccounts(data.value as ReservationPaymentAccounts);
        }
      } catch (err) {
        console.warn('Failed to fetch reservation payment accounts, using fallback.', err);
      }
    }
    loadPaymentAccounts();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Populate phone and active reservation if available in localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('elgzar_active_reservation');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.reservation_number) {
            setInquiryResNum(String(parsed.reservation_number));
          }
          if (parsed?.customer_phone) {
            setCustomerPhone(parsed.customer_phone);
            if (!isSenderPhoneManual) setDepositSenderPhone(parsed.customer_phone);
            setInquiryPhone(parsed.customer_phone);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen, isSenderPhoneManual]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting && !inquiryLoading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, inquiryLoading]);

  // Fetch available slots whenever date changes (for create mode)
  useEffect(() => {
    if (!isOpen || activeTab !== 'create') return;

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
          const firstAvailable = data.slots?.find((s) => s.available);
          if (firstAvailable) {
            setSelectedSlot(firstAvailable.time);
          }
        }
      } catch {
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
  }, [selectedDate, isOpen, activeTab]);

  const handleClose = () => {
    setSuccessInfo(null);
    setErrorMessage(null);
    setInquiryError(null);
    setInquiryResult(null);
    setUploadError(null);
    onClose();
  };

  const handleCopyIdentifier = (textToCopy: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedIdentifier(true);
    setTimeout(() => setCopiedIdentifier(false), 2000);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      setUploadError('نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG أو PNG أو WebP فقط.');
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.');
      return;
    }

    setIsUploadingReceipt(true);

    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `deposit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(error.message || 'فشل رفع صورة الإيصال');
      }

      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);

      const uploadedUrl = publicUrlData.publicUrl;
      setDepositReceiptUrl(uploadedUrl);
      setDepositReceiptPreview(uploadedUrl);
    } catch (err: unknown) {
      console.error('Deposit receipt upload error:', err);
      const msg = err instanceof Error ? err.message : 'تعذر رفع صورة الإيصال';
      setUploadError(msg);
    } finally {
      setIsUploadingReceipt(false);
    }
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

    const cleanSenderPhone = (depositSenderPhone || cleanPhone).trim().replace(/\s+/g, '');
    if (!egPhoneRegex.test(cleanSenderPhone)) {
      setErrorMessage('يرجى إدخال رقم هاتف صحيح تم تحويل مبلغ العربون منه (11 رقماً يبدأ بـ 01)');
      return;
    }

    if (!depositReceiptUrl || depositReceiptUrl.trim().length < 5) {
      setErrorMessage('يلزم رفع صورة إشعار أو سكرين شوت إيصال تحويل العربون لتأكيد الحجز');
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
          deposit_amount: depositAmount,
          deposit_receipt_url: depositReceiptUrl,
          deposit_payment_method: selectedPaymentMethod,
          deposit_sender_phone: cleanSenderPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'تعذر تأكيد الحجز');
        return;
      }

      const resNumber = Number(data.reservation_number || 0);

      // Save local reminder reference safely
      const reservationRef = {
        reservation_number: resNumber,
        customer_phone: cleanPhone,
        reservation_date: selectedDate,
        reservation_time: selectedSlot,
        guest_count: guestCount,
        deposit_amount: depositAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      try {
        localStorage.setItem('elgzar_active_reservation', JSON.stringify(reservationRef));
        window.dispatchEvent(new CustomEvent('active-reservation-updated', { detail: reservationRef }));
      } catch (err) {
        console.warn('Failed to save reservation reference to localStorage', err);
      }

      setSuccessInfo({
        resNumber: resNumber,
        msg: data.message,
        depositAmount: depositAmount,
      });
    } catch {
      setErrorMessage('حدث خطأ في الاتصال، يرجى التأكد من اتصالك بالإنترنت');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    setInquiryError(null);
    setInquiryResult(null);

    const parsedNum = parseInt(inquiryResNum.trim(), 10);
    if (isNaN(parsedNum) || parsedNum <= 0) {
      setInquiryError('يرجى إدخال رقم حجز صحيح');
      return;
    }

    const cleanPhone = inquiryPhone.trim().replace(/\s+/g, '');
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
      setInquiryError('يرجى إدخال رقم الهاتف المسجل به الحجز (11 رقماً يبدأ بـ 01)');
      return;
    }

    try {
      setInquiryLoading(true);
      const res = await fetch('/api/reservations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_number: parsedNum,
          customer_phone: cleanPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setInquiryError(data.error || 'تعذر الاستعلام عن الحجز');
        return;
      }

      if (data.reservation) {
        setInquiryResult(data.reservation);

        // Update local reference with latest authoritative status
        try {
          const reservationRef = {
            reservation_number: data.reservation.reservation_number,
            customer_phone: cleanPhone,
            reservation_date: data.reservation.reservation_date,
            reservation_time: data.reservation.reservation_time,
            guest_count: data.reservation.guest_count,
            deposit_amount: data.reservation.deposit_amount,
            status: data.reservation.status,
            created_at: data.reservation.created_at || new Date().toISOString(),
          };
          localStorage.setItem('elgzar_active_reservation', JSON.stringify(reservationRef));
          window.dispatchEvent(new CustomEvent('active-reservation-updated', { detail: reservationRef }));
        } catch {
          // ignore
        }
      }
    } catch {
      setInquiryError('حدث خطأ في الاتصال، يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً');
    } finally {
      setInquiryLoading(false);
    }
  }

  if (!isOpen) return null;

  const currentAccount =
    selectedPaymentMethod === 'instapay'
      ? paymentAccounts.instapay || DEFAULT_ACCOUNTS.instapay!
      : paymentAccounts.wallet || DEFAULT_ACCOUNTS.wallet!;

  const egPhoneRegex = /^01[0125][0-9]{8}$/;
  const isSenderPhoneValid = egPhoneRegex.test((depositSenderPhone || customerPhone).trim().replace(/\s+/g, ''));
  const isReceiptUploaded = Boolean(depositReceiptUrl && depositReceiptUrl.trim().length > 5);
  const isFormValid =
    customerName.trim().length >= 2 &&
    egPhoneRegex.test(customerPhone.trim().replace(/\s+/g, '')) &&
    Boolean(selectedSlot) &&
    isReceiptUploaded &&
    isSenderPhoneValid &&
    !isUploadingReceipt;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 select-none dir-rtl animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={!submitting && !inquiryLoading ? handleClose : undefined}
      />

      {/* Modal Box */}
      <div
        className="relative bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 my-auto text-right z-10 max-h-[92dvh] overflow-y-auto"
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
            <h2 id="reservation-modal-title" className="text-xl font-black text-white mt-1">
              خدمة حجز الطاولات
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!successInfo && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-950 rounded-2xl border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>حجز طاولة جديدة</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('inquiry');
                setInquiryError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'inquiry'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>الاستعلام عن حجز</span>
            </button>
          </div>
        )}

        {/* --- INQUIRY VIEW --- */}
        {activeTab === 'inquiry' && !successInfo && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-400 text-xs leading-relaxed">
              أدخل رقم الحجز ورقم الهاتف المسجل للتحقق من حالة حجزك وموعده المعتمد.
            </p>

            {inquiryError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold text-xs leading-relaxed flex items-start gap-2">
                <span>⚠️</span>
                <span>{inquiryError}</span>
              </div>
            )}

            {inquiryResult && (
              <div className="p-4 bg-stone-950 border border-amber-500/30 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">رقم الحجز</span>
                    <span className="text-lg font-black text-amber-400">
                      #{inquiryResult.reservation_number}
                    </span>
                  </div>
                  {(() => {
                    const cfg = RESERVATION_STATUS_CONFIG[inquiryResult.status as ReservationStatus] || {
                      label: inquiryResult.status,
                      icon: '📌',
                      color: 'text-stone-300',
                      bgColor: 'bg-stone-800',
                      borderColor: 'border-stone-700',
                    };
                    return (
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}`}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800/80">
                    <span className="text-stone-500 text-[10px] block font-bold">التاريخ</span>
                    <span className="font-bold text-stone-200 mt-0.5 block">{inquiryResult.reservation_date}</span>
                  </div>
                  <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800/80">
                    <span className="text-stone-500 text-[10px] block font-bold">الموعد</span>
                    <span className="font-bold text-stone-200 mt-0.5 block">{inquiryResult.reservation_time}</span>
                  </div>
                  <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800/80">
                    <span className="text-stone-500 text-[10px] block font-bold">الأفراد</span>
                    <span className="font-bold text-stone-200 mt-0.5 block">{inquiryResult.guest_count} ضيوف</span>
                  </div>
                </div>

                {inquiryResult.deposit_amount && Number(inquiryResult.deposit_amount) > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center">
                    <span className="text-[11px] text-amber-300 font-bold">
                      💳 العربون المسجل: {inquiryResult.deposit_amount} ج.م (يُخصم من الفاتورة)
                    </span>
                  </div>
                )}

                <p className="text-[11px] text-stone-400 text-center pt-1">
                  {inquiryResult.status === 'confirmed'
                    ? '✨ تم تأكيد حجزك رسمياً، ننتظر تشريفكم لنا في الموعد المحدد!'
                    : inquiryResult.status === 'pending'
                    ? '⏳ طلب الحجز قيد المراجعة وسيقوم فريق المطعم بالتأكيد هاتفياً.'
                    : inquiryResult.status === 'cancelled'
                    ? '❌ تم إلغاء هذا الحجز. يمكنك إنشاء حجز جديد في أي وقت.'
                    : 'حالة الحجز مسجلة في النظام.'}
                </p>
              </div>
            )}

            <form onSubmit={handleInquirySubmit} className="space-y-3">
              <div>
                <label className="font-bold text-stone-300 block mb-1">رقم الحجز:</label>
                <input
                  type="number"
                  required
                  value={inquiryResNum}
                  onChange={(e) => setInquiryResNum(e.target.value)}
                  placeholder="مثال: 1042"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 text-base sm:text-xs focus:outline-none focus:border-amber-500 font-mono min-h-[44px]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">رقم الهاتف للتأكيد:</label>
                <input
                  type="tel"
                  required
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 text-base sm:text-xs focus:outline-none focus:border-amber-500 font-mono min-h-[44px]"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm transition-all disabled:opacity-50 shadow-lg shadow-amber-500/10 min-h-[48px] flex items-center justify-center active:scale-[0.98]"
                >
                  {inquiryLoading ? 'جاري التحقق من الحجز...' : 'استعلام عن حالة الحجز'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-3 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs sm:text-sm transition-colors min-h-[48px] flex items-center justify-center active:scale-[0.98]"
                >
                  إغلاق
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- CREATE VIEW --- */}
        {activeTab === 'create' && (
          <>
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

                <div className="p-3 bg-stone-950 border border-amber-500/20 rounded-2xl max-w-sm mx-auto text-right space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">عربون الطاولة:</span>
                    <span className="font-bold text-emerald-400">{successInfo.depositAmount} ج.م (مسجل)</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    تم تسجيل إيصال التحويل بنجاح، وسيتم خصم هذا المبلغ بالكامل من فاتورة طعامك عند الحضور.
                  </p>
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
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Date Display (Authoritative Same-Day Only) */}
                <div className="flex items-center justify-between p-3.5 bg-stone-950 border border-stone-800 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📅</span>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold block">تاريخ الحجز (اليوم فقط):</span>
                      <span className="font-bold text-stone-200 text-xs sm:text-sm">
                        {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    متاح اليوم فقط
                  </span>
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 bg-stone-950/60 rounded-xl border border-stone-800/80">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-stone-300">عدد الأفراد (الضيوف):</label>
                    <span className="text-[11px] font-black text-amber-400">
                      العربون: {depositAmount} ج.م
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                    {[1, 2, 3, 4, 6, 8, 10, 12, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestCount(num)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs shrink-0 transition-all min-h-[40px] flex items-center justify-center ${
                          guestCount === num
                            ? 'bg-amber-500 text-stone-950 font-black'
                            : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {num} {num === 1 ? 'فرد' : num === 2 ? 'فردين' : 'أفراد'}
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
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 text-base sm:text-xs focus:outline-none focus:border-amber-500 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-300 block mb-1">رقم الهاتف للتأكيد:</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 text-base sm:text-xs focus:outline-none focus:border-amber-500 font-mono min-h-[44px]"
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
                    placeholder="مثال: طاولة عائلية، منطقة هادئة..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 text-base sm:text-xs focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>

                {/* --- ARABON / DEPOSIT PAYMENT SECTION --- */}
                <div className="p-4 bg-stone-950 border border-amber-500/30 rounded-2xl space-y-3.5 animate-fade-in text-right">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💳</span>
                      <div>
                        <h4 className="font-black text-amber-400 text-xs sm:text-sm">
                          عربون تأكيد حجز الطاولة ({depositAmount} ج.م)
                        </h4>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          100 ج.م لكل 3 أفراد · يُخصم بالكامل من فاتورة طعامك
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-300 mb-1.5">
                      اختر وسيلة تحويل العربون:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('instapay')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                          selectedPaymentMethod === 'instapay'
                            ? 'border-amber-500 bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40'
                            : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>⚡ إنستاباي (Instapay)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('wallet')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                          selectedPaymentMethod === 'wallet'
                            ? 'border-amber-500 bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40'
                            : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>📱 محفظة كاش</span>
                      </button>
                    </div>
                  </div>

                  {/* Account Details Box */}
                  <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-stone-400 font-bold">
                        {selectedPaymentMethod === 'instapay' ? 'عنوان الدفع اللحظي (IPA):' : 'رقم محفظة كاش:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyIdentifier(currentAccount.identifier)}
                        className="text-[10px] bg-stone-800 hover:bg-stone-700 text-amber-400 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        {copiedIdentifier ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ الرقم</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between font-mono font-black text-white text-sm bg-stone-950 px-3 py-2 rounded-lg border border-stone-800" dir="ltr">
                      <span>{currentAccount.identifier}</span>
                      <span className="text-[10px] font-sans font-normal text-stone-400">({currentAccount.account_name})</span>
                    </div>

                    {currentAccount.note && (
                      <p className="text-[10px] text-stone-400 leading-relaxed">
                        💡 {currentAccount.note}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-bold pt-0.5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>تنبيه: مدة صلاحية عملية التحويل 15 دقيقة لربطها بالحجز</span>
                    </div>
                  </div>

                  {/* Sender Phone */}
                  <div>
                    <label className="font-bold text-stone-300 block mb-1">
                      رقم الموبايل الذي تم التحويل منه (المحول): <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={depositSenderPhone}
                      onChange={(e) => handleSenderPhoneChange(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className={`w-full bg-stone-900 border rounded-xl px-3.5 py-2 text-stone-200 text-base sm:text-xs focus:outline-none font-mono min-h-[40px] ${
                        isSenderPhoneValid ? 'border-emerald-500/50' : 'border-stone-800 focus:border-amber-500'
                      }`}
                      dir="ltr"
                    />
                  </div>

                  {/* Screenshot Proof Upload */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-300 block">
                      صورة إشعار / إيصال التحويل: <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleReceiptUpload}
                      disabled={isUploadingReceipt || submitting}
                      className="hidden"
                      id="reservation-deposit-upload"
                    />
                    <label
                      htmlFor="reservation-deposit-upload"
                      className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold min-h-[44px] ${
                        isUploadingReceipt
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : depositReceiptPreview
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-stone-700 bg-stone-900 hover:border-amber-500 text-stone-300'
                      }`}
                    >
                      {isUploadingReceipt ? (
                        <span>جاري رفع صورة الإيصال...</span>
                      ) : depositReceiptPreview ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم رفع إثبات العربون بنجاح ✓</span>
                        </span>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>اضغط هنا لرفع سكرين شوت إيصال التحويل</span>
                        </>
                      )}
                    </label>

                    {uploadError && (
                      <p className="text-red-400 text-[10px] font-bold">{uploadError}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !isFormValid}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm transition-all disabled:opacity-50 shadow-lg shadow-amber-500/10 min-h-[48px] flex items-center justify-center active:scale-[0.98] disabled:cursor-not-allowed"
                  >
                    {submitting ? 'جاري إرسال وتأكيد الطلب...' : `تأكيد حجز الطاولة (${depositAmount} ج.م عربون)`}
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
          </>
        )}
      </div>
    </div>
  );
}
