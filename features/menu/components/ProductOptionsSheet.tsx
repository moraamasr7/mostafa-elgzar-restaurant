'use client';

import React, { useState, useEffect } from 'react';
import { GroupedMenuItem, MenuItemVariant } from '@/types/menu';
import { CartLine } from '@/types/orders';
import { X, ShoppingBag, Check, Plus, Minus, Flame } from 'lucide-react';
import { useScrollLock } from '@/lib/hooks/useScrollLock';
import { normalizeImageUrl, DEFAULT_FALLBACK_IMAGE } from '@/lib/image-utils';

interface ProductOptionsSheetProps {
  isOpen: boolean;
  item: GroupedMenuItem | null;
  onClose: () => void;
  onAddToCart: (line: CartLine) => void;
}

export default function ProductOptionsSheet({
  isOpen,
  item,
  onClose,
  onAddToCart,
}: ProductOptionsSheetProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  useScrollLock(isOpen);

  // Sync state whenever the selected item changes or sheet opens
  useEffect(() => {
    if (item && isOpen) {
      const availableVariants = item.variants.filter((v) => v.available);
      const defaultVariant = availableVariants[0] || item.variants[0];
      setSelectedVariantId(defaultVariant?.id || '');
      setQuantity(1);
      setNotes('');
      setImageError(false);
      setIsAdding(false);
    }
  }, [item, isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const availableVariants = item.variants.filter((v) => v.available);
  const selectedVariant =
    item.variants.find((v) => v.id === selectedVariantId) ||
    availableVariants[0] ||
    item.variants[0];

  const currentPrice = selectedVariant?.price || 0;
  const totalPrice = currentPrice * quantity;
  const isFullyUnavailable = !item.available || availableVariants.length === 0;

  const rawImageUrl = item.image_url || item.image || null;
  const normalizedUrl = normalizeImageUrl(rawImageUrl);
  const displayImageUrl = normalizedUrl && !imageError ? normalizedUrl : DEFAULT_FALLBACK_IMAGE;

  const handleAdd = () => {
    if (!selectedVariant || isFullyUnavailable || isAdding) return;

    setIsAdding(true);

    onAddToCart({
      variant_id: selectedVariant.id,
      item_name: item.name,
      variant_name: selectedVariant.name,
      price: selectedVariant.price,
      quantity,
      item_notes: notes.trim() || undefined,
    });

    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none dir-rtl animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet Box */}
      <div
        className="relative w-full max-w-lg bg-stone-900 border border-stone-800 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90dvh] sm:max-h-[85vh] flex flex-col animate-slide-up overflow-hidden z-10 text-stone-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="options-sheet-title"
      >
        {/* Header with image */}
        <div className="relative shrink-0">
          <div className="relative w-full h-44 sm:h-52 bg-stone-950 overflow-hidden">
            <img
              src={displayImageUrl}
              alt={item.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 left-3 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-stone-900 text-stone-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10 cursor-pointer min-w-[40px] min-h-[40px] z-10"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title overlay */}
          <div className="p-4 sm:p-5 pt-3">
            <h3 id="options-sheet-title" className="font-bold text-xl text-white">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-stone-300 text-xs sm:text-sm mt-1 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Variants Selection */}
          {availableVariants.length > 1 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-gold-400">
                اختر الحجم / النوع المطلـوب:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableVariants.map((variant: MenuItemVariant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`p-3 rounded-2xl text-right border transition-all flex items-center justify-between min-h-[50px] cursor-pointer ${
                        isSelected
                          ? 'bg-primary-600/20 border-primary-500 text-white shadow-md shadow-primary-500/10 ring-1 ring-primary-500/50'
                          : 'bg-stone-800/60 hover:bg-stone-800 border-stone-700/60 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-stone-500'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-bold text-sm">{variant.name}</span>
                      </div>
                      <span className="font-black text-sm text-gold-400 tabular-nums">
                        {variant.price} ج.م
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes / Customization Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-400">
              ملاحظات التحضير <span className="text-stone-500 font-normal">(اختياري)</span>:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: طحينة زيادة، مشوي كويس، بدون شطة..."
              className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-primary-500 transition-all min-h-[46px]"
            />
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-800/40 border border-stone-800">
            <span className="text-xs font-bold text-stone-300">الكمية المطلوبة:</span>
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-all font-bold active:scale-95 min-w-[40px] min-h-[40px] cursor-pointer"
                aria-label="تقليل الكمية"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-black text-sm text-white tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-all font-bold active:scale-95 min-w-[40px] min-h-[40px] cursor-pointer"
                aria-label="زيادة الكمية"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Bottom CTA Bar */}
        <div
          className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/90 backdrop-blur-md shrink-0 flex items-center justify-between gap-3"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0.75rem))' }}
        >
          <div className="flex flex-col text-right">
            <span className="text-[11px] text-stone-400 font-semibold">إجمالي الصنف</span>
            <span className="text-lg sm:text-xl font-black text-gold-400 tabular-nums">
              {totalPrice.toFixed(0)} <small className="text-xs font-bold text-stone-300">ج.م</small>
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isFullyUnavailable || !selectedVariant || isAdding}
            className="flex-1 btn-primary py-3 px-5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 active:scale-[0.98] disabled:opacity-50 min-h-[48px] cursor-pointer"
          >
            {isAdding ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تمت الإضافة للسلة ✓</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>أضف للطلب</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
