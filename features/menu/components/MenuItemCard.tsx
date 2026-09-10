'use client';

import React, { useState } from 'react';
import { GroupedMenuItem } from '@/types/menu';
import { CartLine } from '@/types/orders';
import { ShoppingBag, Check } from 'lucide-react';

interface MenuItemCardProps {
  item: GroupedMenuItem;
  onAddToCart?: (line: CartLine) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const availableVariants = item.variants.filter((v) => v.available);
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id || item.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = item.variants.find((v) => v.id === selectedVariantId) || item.variants[0];
  const isFullyUnavailable = !item.available || availableVariants.length === 0;

  const handleAdd = () => {
    if (!selectedVariant || isFullyUnavailable) return;

    if (onAddToCart) {
      onAddToCart({
        variant_id: selectedVariant.id,
        item_name: item.name,
        variant_name: selectedVariant.name,
        price: selectedVariant.price,
        quantity: quantity,
        item_notes: notes.trim() || undefined,
      });
    }

    setQuantity(1);
    setNotes('');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  const currentPrice = selectedVariant?.price || 0;
  const totalPrice = currentPrice * quantity;

  return (
    <div
      className={`group glass-card p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover-lift ${
        isFullyUnavailable ? 'opacity-50 grayscale' : ''
      } ${
        justAdded
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
          : 'border-stone-200 dark:border-white/10'
      }`}
    >
      <div>
        {/* Title & Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
            {item.name}
          </h3>
          {isFullyUnavailable ? (
            <span className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">
              غير متوفر
            </span>
          ) : justAdded ? (
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>تمت الإضافة</span>
            </span>
          ) : (
            <span className="text-gold-600 dark:text-gold-400 font-black text-base shrink-0 tabular-nums">
              {currentPrice > 0 ? `${currentPrice} ج.م` : 'حسب الاختيار'}
            </span>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-stone-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2 min-h-[36px]">
            {item.description}
          </p>
        )}

        {/* Variants Selector */}
        {!isFullyUnavailable && availableVariants.length > 1 && (
          <div className="space-y-1.5 my-3 pt-2 border-t border-stone-200/60 dark:border-white/5">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 block">
              اختر الحجم / النوع:
            </span>
            <div className="flex flex-wrap gap-2">
              {availableVariants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border min-h-[40px] flex items-center ${
                      isSelected
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm shadow-primary-500/20 scale-[1.02]'
                        : 'bg-stone-100 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-700 dark:text-gray-300 hover:border-primary-500/50'
                    }`}
                  >
                    <span>{variant.name}</span>
                    <span className="mr-1 opacity-80 tabular-nums">· {variant.price} ج</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      {!isFullyUnavailable && (
        <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-white/5 space-y-2.5">
          <input
            type="text"
            placeholder="ملاحظات خاصة (بدون بصل، مشوي زيادة...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 dark:bg-dark-900/80 border border-stone-200 dark:border-white/10 rounded-xl text-xs placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-primary-500/50 transition-all text-stone-900 dark:text-white min-h-[40px]"
          />

          <div className="flex items-center justify-between gap-2">
            {/* Quantity Stepper - Minimum 40px touch targets */}
            <div className="flex items-center bg-stone-100 dark:bg-white/5 p-1 rounded-xl border border-stone-200 dark:border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-dark-800 hover:bg-stone-200 dark:hover:bg-dark-700 text-stone-900 dark:text-white rounded-lg transition-all font-bold text-base active:scale-95 shadow-xs min-w-[40px] min-h-[40px]"
                aria-label="تقليل الكمية"
              >
                −
              </button>
              <span className="w-8 text-center text-xs font-black text-stone-900 dark:text-white tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-all font-bold text-base active:scale-95 shadow-xs min-w-[40px] min-h-[40px]"
                aria-label="زيادة الكمية"
              >
                +
              </button>
            </div>

            {/* Add to Order Button - Minimum 44px touch target */}
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 btn-primary text-xs sm:text-sm py-2.5 px-3.5 flex items-center justify-center gap-1.5 font-bold shadow-md shadow-primary-500/20 active:scale-[0.98] min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>إضافة للطلب</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-[11px] font-black tabular-nums mr-0.5">
                {totalPrice.toFixed(0)} ج
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
