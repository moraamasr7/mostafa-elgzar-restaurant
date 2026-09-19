'use client';

import React, { useState } from 'react';
import { OpenShiftRequest } from '@/types/shifts';

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OpenShiftModal({ isOpen, onClose, onSuccess }: OpenShiftModalProps) {
  const [openedBy, setOpenedBy] = useState('');
  const [initialCash, setInitialCash] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = openedBy.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('يرجى إدخال اسم مسؤول فتح الوردية (حرفين على الأقل)');
      return;
    }

    const parsedCash = Number(initialCash);
    if (isNaN(parsedCash) || parsedCash < 0) {
      setErrorMessage('عهدة البداية يجب أن تكون رقماً موجباً أو صفراً');
      return;
    }

    try {
      setLoading(true);
      const payload: OpenShiftRequest = {
        opened_by: trimmedName,
        initial_cash: parsedCash,
      };

      const res = await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'تعذر فتح الوردية');
        return;
      }

      // Success
      setOpenedBy('');
      setInitialCash('0');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none dir-rtl">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>🟢</span>
              <span>فتح وردية جديدة للمطعم</span>
            </h3>
            <p className="text-stone-400 text-xs mt-1">
              تسجيل بيانات بدء وردية العمل واستلام عهدة درج الكاشير
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-stone-400 hover:text-white p-1 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              اسم مسؤول الوردية (الكاشير / المدير): <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={loading}
              value={openedBy}
              onChange={(e) => setOpenedBy(e.target.value)}
              placeholder="مثال: أحمد مصطفى"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              عهدة بداية الوردية (نقدية بالدرج): <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                required
                disabled={loading}
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                placeholder="0.00"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 pl-12 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors font-mono tabular-nums"
              />
              <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-500 pointer-events-none">
                ج.م
              </span>
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">
              المبلغ النقدي المتواجد في الدرج كفكة في بداية الشيفت
            </span>
          </div>

          <div className="flex gap-3 pt-3 border-t border-stone-800">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-md shadow-amber-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري فتح الوردية...</span>
                </>
              ) : (
                <span>تأكيد وفتح الوردية</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
