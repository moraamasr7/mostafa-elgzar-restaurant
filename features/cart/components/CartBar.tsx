'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartBar() {
  const { totalCount, totalPrice, openCart } = useCart();

  if (totalCount === 0) return null;

  return (
    <div
      className="fixed z-50 max-w-lg mx-auto left-4 right-4 animate-slide-up select-none"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <button
        type="button"
        onClick={openCart}
        className="group w-full bg-stone-900/95 dark:bg-dark-950/95 text-white p-3 pr-4 sm:pr-5 rounded-2xl shadow-2xl shadow-black/50 border border-stone-700/50 dark:border-white/10 backdrop-blur-xl flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
        aria-label={`عرض السلة: ${totalCount} عناصر، الإجمالي ${totalPrice.toFixed(0)} ج`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 shrink-0 bg-primary-600 rounded-xl flex items-center justify-center relative shadow-md shadow-primary-500/30 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 bg-gold-500 text-stone-950 text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-stone-900 tabular-nums">
              {totalCount}
            </span>
          </div>
          <div className="flex flex-col items-start min-w-0 text-right">
            <span className="text-[11px] font-bold text-stone-400 dark:text-gray-400">إجمالي الطلب</span>
            <span className="font-black text-lg text-white truncate tabular-nums">
              {totalPrice.toFixed(0)} <small className="text-xs text-gold-400 font-bold">ج.م</small>
            </span>
          </div>
        </div>

        <div className="btn-primary py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0">
          <span>عرض السلة</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </div>
      </button>
    </div>
  );
}
