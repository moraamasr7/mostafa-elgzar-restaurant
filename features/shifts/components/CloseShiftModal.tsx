'use client';

import React, { useState } from 'react';
import { DailyShift, CloseShiftRequest, ShiftReconciliationResult } from '@/types/shifts';

interface CloseShiftModalProps {
  shift: DailyShift;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CloseShiftModal({
  shift,
  isOpen,
  onClose,
  onSuccess,
}: CloseShiftModalProps) {
  const [closedBy, setClosedBy] = useState('');
  const [finalCash, setFinalCash] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reconciliationResult, setReconciliationResult] = useState<ShiftReconciliationResult | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = closedBy.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('يرجى إدخال اسم مسؤول إغلاق الوردية (حرفين على الأقل)');
      return;
    }

    const parsedFinalCash = Number(finalCash);
    if (finalCash === '' || isNaN(parsedFinalCash) || parsedFinalCash < 0) {
      setErrorMessage('يرجى إدخال المبلغ الفعلي الموجود في الدرج (رقماً موجباً أو صفراً)');
      return;
    }

    try {
      setLoading(true);
      const payload: CloseShiftRequest = {
        shift_id: shift.id,
        closed_by: trimmedName,
        final_cash: parsedFinalCash,
        notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/admin/shifts/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'تعذر إغلاق الوردية');
        return;
      }

      // Authoritative result received from backend
      if (data.reconciliation) {
        setReconciliationResult(data.reconciliation);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none dir-rtl">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>🔒</span>
              <span>
                {reconciliationResult
                  ? `ملخص إغلاق الوردية #${reconciliationResult.shift_number}`
                  : `إغلاق وتسوية الوردية #${shift.shift_number}`}
              </span>
            </h3>
            <p className="text-stone-400 text-xs mt-1">
              {reconciliationResult
                ? 'تقرير التسوية النقدية المعتمد والصادر من الخادم'
                : 'جرد النقدية بالدرج وحساب التسوية المالية الرسمية للوردية'}
            </p>
          </div>
          {!reconciliationResult && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-stone-400 hover:text-white p-1 rounded-lg text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Step 1: Form View */}
        {!reconciliationResult ? (
          <>
            {/* Shift Context Card */}
            <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-stone-400">
                <span>مسؤول الفتح:</span>
                <span className="font-bold text-white">{shift.opened_by}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>وقت الفتح:</span>
                <span className="font-mono text-stone-200" dir="ltr">
                  {new Date(shift.opened_at).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>عهدة البداية (المسجلة):</span>
                <span className="font-black text-amber-400 font-mono tabular-nums">
                  {Number(shift.initial_cash).toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed flex items-start gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1.5">
                  اسم مسؤول الإغلاق (الكاشير المستلم / المشرف): <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={closedBy}
                  onChange={(e) => setClosedBy(e.target.value)}
                  placeholder="مثال: محمود علي"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1.5">
                  الجرد الفعلي للنقدية بالدرج (Final Cash): <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    disabled={loading}
                    value={finalCash}
                    onChange={(e) => setFinalCash(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 pl-12 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors font-mono tabular-nums"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-500 pointer-events-none">
                    ج.م
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  المبلغ الحقيقي المعدود يدوياً في الخزينة عند الإغلاق
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1.5">
                  ملاحظات الإغلاق (اختياري):
                </label>
                <textarea
                  rows={2}
                  disabled={loading}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات حول الجرد أو التسليم..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-stone-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-md shadow-rose-600/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري إغلاق الوردية وحساب التسوية...</span>
                    </>
                  ) : (
                    <span>تأكيد الإغلاق والتسوية النقدية</span>
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
          </>
        ) : (
          /* Step 2: Authoritative Reconciliation Report Display (Presentation Only) */
          <div className="space-y-4">
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-stone-800/80 pb-2.5">
                <span className="text-stone-400">عهدة البداية:</span>
                <span className="font-bold text-stone-200 tabular-nums font-mono">
                  {reconciliationResult.initial_cash.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-800/80 pb-2.5">
                <span className="text-stone-400">
                  مبيعات كاش بالوردية ({reconciliationResult.cash_orders_count} طلب):
                </span>
                <span className="font-bold text-emerald-400 tabular-nums font-mono">
                  +{reconciliationResult.cash_sales_total.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-800/80 pb-2.5">
                <span className="text-stone-400">
                  مصروفات الوردية ({reconciliationResult.expenses_count} بند):
                </span>
                <span className="font-bold text-rose-400 tabular-nums font-mono">
                  -{reconciliationResult.expenses_total.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-800/80 pb-2.5 pt-1">
                <span className="text-stone-300 font-bold">النقدية المتوقعة بالنظام (Expected Cash):</span>
                <span className="font-black text-amber-400 text-sm tabular-nums font-mono">
                  {reconciliationResult.system_expected_cash.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-800/80 pb-2.5">
                <span className="text-stone-300 font-bold">النقدية الفعلية بالدرج (الجرد):</span>
                <span className="font-black text-white text-sm tabular-nums font-mono">
                  {reconciliationResult.final_cash.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between pt-1 items-center">
                <span className="text-stone-300 font-black">نتيجة التسوية (الفارق):</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-sm px-3 py-1 rounded-xl font-mono tabular-nums border ${
                      reconciliationResult.discrepancy === 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : reconciliationResult.discrepancy > 0
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {reconciliationResult.discrepancy === 0
                      ? '✅ متطابق تماماً (0.00 ج.م)'
                      : reconciliationResult.discrepancy > 0
                      ? `📈 زيادة: +${reconciliationResult.discrepancy.toLocaleString()} ج.م`
                      : `📉 عجز: ${reconciliationResult.discrepancy.toLocaleString()} ج.م`}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-md shadow-amber-500/10"
              >
                إتمام وإغلاق النافذة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
