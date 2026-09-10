'use client';

import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, X, Trash2, ArrowLeft } from 'lucide-react';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

export default function CartModal() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    openCheckout,
    totalPrice,
  } = useCart();

  useScrollLock(isCartOpen);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none dir-rtl animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Modal / Drawer Box */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-dark-900 border border-stone-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88dvh] sm:max-h-[85vh] flex flex-col animate-slide-up overflow-hidden z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cart-modal-title" className="font-bold text-lg text-stone-900 dark:text-white">سلة الطلب</h2>
              <span className="text-xs text-stone-500 dark:text-gray-400">{cart.length} أصناف مضافة</span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="w-11 h-11 rounded-full bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors text-sm font-bold min-w-[44px] min-h-[44px]"
            aria-label="إغلاق السلة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-900 dark:text-white text-base">السلة فارغة حالياً</h3>
              <p className="text-stone-500 dark:text-gray-400 text-xs max-w-xs mx-auto">
                تصفح قائمة الطعام واختر وجباتك المفضلة لإضافتها ومتابعة الطلب
              </p>
            </div>
          ) : (
            cart.map((line) => (
              <div
                key={line.variant_id}
                className="bg-stone-50 dark:bg-white/5 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 border border-stone-200/80 dark:border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm truncate">
                    {line.item_name}
                  </h4>
                  {line.variant_name && line.variant_name !== 'افتراضي' && (
                    <span className="inline-block text-[11px] font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                      الحجم: {line.variant_name}
                    </span>
                  )}
                  {line.item_notes && (
                    <p className="text-xs text-gold-600 dark:text-gold-400 mt-1 truncate">
                      📝 {line.item_notes}
                    </p>
                  )}
                  <p className="text-stone-900 dark:text-white font-black text-sm mt-1.5 tabular-nums">
                    {(line.price * line.quantity).toFixed(0)} <small className="text-xs font-bold text-gold-600 dark:text-gold-400">ج.م</small>
                  </p>
                </div>

                {/* Stepper & Remove - 40px touch targets */}
                <div className="flex items-center gap-0 border border-stone-200 dark:border-white/10 bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (line.quantity <= 1) {
                        removeFromCart(line.variant_id);
                      } else {
                        updateQuantity(line.variant_id, line.quantity - 1);
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-red-500/10 hover:text-red-600 transition-colors min-w-[40px] min-h-[40px]"
                    aria-label={line.quantity <= 1 ? "حذف الصنف من السلة" : "تقليل الكمية"}
                  >
                    {line.quantity <= 1 ? (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    ) : (
                      <span className="font-bold text-base leading-none">−</span>
                    )}
                  </button>
                  <span className="px-2 text-xs font-black text-stone-900 dark:text-white min-w-[1.75rem] text-center tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.variant_id, line.quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-primary-500/10 hover:text-primary-600 transition-colors font-bold text-base leading-none min-w-[40px] min-h-[40px]"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Safe Area Support */}
        {cart.length > 0 && (
          <div
            className="p-4 sm:p-5 border-t border-stone-200 dark:border-white/10 bg-stone-50/80 dark:bg-dark-950/80 backdrop-blur-md space-y-3"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0.75rem))' }}
          >
            <div className="flex justify-between items-center px-1">
              <span className="text-stone-500 dark:text-gray-400 font-bold text-sm">الإجمالي النهائي:</span>
              <span className="font-black text-2xl text-stone-900 dark:text-white tabular-nums">
                {totalPrice.toFixed(0)} <small className="text-sm text-gold-600 dark:text-gold-400 font-bold">ج.م</small>
              </span>
            </div>
            <button
              type="button"
              onClick={openCheckout}
              className="w-full btn-primary py-3.5 rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 active:scale-[0.98] min-h-[48px]"
            >
              <span>متابعة وإتمام الطلب</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

