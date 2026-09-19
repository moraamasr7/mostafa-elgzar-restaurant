'use client';

import React, { useState, useEffect } from 'react';
import { FeedbackType } from '../types/feedback.types';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

interface CustomerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerFeedbackModal({ isOpen, onClose }: CustomerFeedbackModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleClose = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('يرجى إدخال اسمك');
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/\s+/g, '');
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
      setErrorMessage('يرجى إدخال رقم هاتف مصري صحيح (11 رقماً)');
      return;
    }

    if (message.trim().length < 10) {
      setErrorMessage('يرجى كتابة تفاصيل رسالتك أو مقترحك (10 أحرف على الأقل)');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: cleanPhone,
          feedback_type: feedbackType,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'تعذر إرسال الرسالة');
        return;
      }

      setSuccessMessage(data.message || 'تم إرسال رسالتك بنجاح');
    } catch (err) {
      setErrorMessage('حدث خطأ في الاتصال، يرجى المحاولة لاحقاً');
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

      {/* Modal Box */}
      <div
        className="relative bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl space-y-5 my-auto text-right z-10 max-h-[92dvh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              خدمة العملاء والجودة
            </span>
            <h2 id="feedback-modal-title" className="text-xl font-black text-white mt-1">الشكاوى والمقترحات</h2>
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
        {successMessage ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              💌
            </div>
            <h3 className="text-base font-black text-white">وصلتنا رسالتك باهتمام</h3>
            <p className="text-stone-300 text-xs leading-relaxed max-w-sm mx-auto">
              {successMessage}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-lg shadow-amber-500/10"
              >
                العودة للتصفح
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

            {/* Type Selector Tabs */}
            <div>
              <label className="font-bold text-stone-300 block mb-1.5">نوع الرسالة:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackType('suggestion')}
                  className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                    feedbackType === 'suggestion'
                      ? 'bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/10'
                      : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>💡</span>
                  <span>مقترح أو إشادة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('complaint')}
                  className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                    feedbackType === 'complaint'
                      ? 'bg-orange-600 text-white font-black shadow-md shadow-orange-600/10'
                      : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>⚠️</span>
                  <span>شكوى أو ملاحظة</span>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <div>
                <label className="font-bold text-stone-300 block mb-1">الاسم الكريم:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="الاسم"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 text-base sm:text-xs focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">رقم الهاتف:</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 text-base sm:text-xs focus:outline-none focus:border-amber-500 font-mono min-h-[44px]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">تفاصيل الرسالة:</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب مقترحك أو تفاصيل الشكوى بوضوح لمساعدتنا على تقديم أفضل خدمة تليق بكم..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-stone-200 text-base sm:text-xs focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm transition-all disabled:opacity-50 shadow-lg shadow-amber-500/10 min-h-[48px] flex items-center justify-center active:scale-[0.98]"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة للإدارة'}
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
