'use client';

import React, { useState } from 'react';
import { useActiveShift } from '../hooks/useActiveShift';
import OpenShiftModal from './OpenShiftModal';
import CloseShiftModal from './CloseShiftModal';

export default function ShiftBar() {
  const { activeShift, hasActiveShift, loading, error, errorCode, refreshShift } = useActiveShift();
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // 1. Loading State
  if (loading && !activeShift) {
    return (
      <div className="bg-stone-900/60 border-b border-stone-800/80 px-4 py-2 text-xs flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
          <div className="h-3.5 w-32 bg-stone-800 rounded" />
        </div>
        <div className="h-6 w-24 bg-stone-800 rounded-lg" />
      </div>
    );
  }

  // 2. Data Integrity Anomaly / Error State
  if (error && errorCode === 'MULTIPLE_ACTIVE_SHIFTS_ANOMALY') {
    return (
      <div className="bg-rose-950/80 border-b border-rose-800 px-4 py-2.5 text-xs text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🚨</span>
          <span className="font-bold">{error}</span>
        </div>
        <button
          onClick={() => refreshShift()}
          className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
        >
          إعادة فحص الوردية
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-stone-900 border-b border-stone-800/90 px-4 sm:px-6 lg:px-8 py-2.5 text-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {hasActiveShift && activeShift ? (
            /* Active Shift Info */
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-black text-emerald-400">الوردية مفتوحة</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-mono font-bold tabular-nums">
                  #{activeShift.shift_number}
                </span>
              </div>

              <div className="text-stone-400 flex items-center gap-1.5">
                <span>المسؤول:</span>
                <span className="font-bold text-white">{activeShift.opened_by}</span>
              </div>

              <div className="text-stone-400 flex items-center gap-1.5">
                <span>وقت الفتح:</span>
                <span className="font-mono text-stone-300 tabular-nums" dir="ltr">
                  {new Date(activeShift.opened_at).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-stone-400 flex items-center gap-1.5">
                <span>عهدة البداية:</span>
                <span className="font-bold font-mono text-amber-400 tabular-nums">
                  {Number(activeShift.initial_cash).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          ) : (
            /* No Active Shift Notice */
            <div className="flex items-center gap-2 text-stone-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <span className="font-bold text-stone-300">لا توجد وردية عمل مفتوحة حالياً بالمطعم</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            {hasActiveShift && activeShift ? (
              <button
                type="button"
                onClick={() => setShowCloseModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800/80 border border-stone-700 text-stone-200 font-bold transition-all flex items-center gap-1.5"
              >
                <span>🔒</span>
                <span>إغلاق وتسوية الوردية</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowOpenModal(true)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <span>🟢</span>
                <span>فتح وردية جديدة</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <OpenShiftModal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        onSuccess={() => {
          refreshShift();
        }}
      />

      {activeShift && (
        <CloseShiftModal
          shift={activeShift}
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          onSuccess={() => {
            refreshShift();
          }}
        />
      )}
    </>
  );
}
