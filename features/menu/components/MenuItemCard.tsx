'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GroupedMenuItem } from '@/types/menu';
import { CartLine } from '@/types/orders';
import { ShoppingBag, Check, ZoomIn, X, ImageIcon } from 'lucide-react';

interface MenuItemCardProps {
  item: GroupedMenuItem;
  onAddToCart?: (line: CartLine) => void;
}

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Convert Google Drive sharing links:
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing -> https://drive.google.com/uc?export=view&id=FILE_ID
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const match = trimmed.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }

  return trimmed;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const availableVariants = item.variants.filter((v) => v.available);
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id || item.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  // Image states: error handling and full-screen mobile lightbox preview
  const [imageError, setImageError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const rawImageUrl = item.image_url || item.image || null;
  const imageUrl = normalizeImageUrl(rawImageUrl);
  const hasValidImage = Boolean(imageUrl && !imageError);

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
    <>
      <div
        className={`group glass-card rounded-2xl flex flex-col justify-between transition-all duration-300 hover-lift overflow-hidden ${
          isFullyUnavailable ? 'opacity-50 grayscale' : ''
        } ${
          justAdded
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
            : 'border-stone-200 dark:border-white/10'
        }`}
      >
        {/* Item Image Section (Responsive, Fixed Aspect Ratio, Touch Preview) */}
        {hasValidImage && (
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-stone-100 dark:bg-dark-900 overflow-hidden group/img">
            <Image
              src={imageUrl!}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              onError={() => setImageError(true)}
              className="object-cover transition-transform duration-500 group-hover/img:scale-105 cursor-pointer select-none"
              onClick={() => setIsZoomOpen(true)}
            />
            {/* Quick Mobile Zoom Tap Badge */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-2 left-2 px-2.5 py-1 bg-stone-950/75 hover:bg-stone-900 text-white rounded-lg backdrop-blur-md text-[11px] font-bold flex items-center gap-1 transition-all opacity-90 hover:opacity-100 shadow-sm cursor-pointer"
              title="اضغط للتكبير"
              aria-label="تكبير صورة الوجبة"
            >
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">تكبير</span>
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
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
      </div>

      {/* Mobile Fullscreen Zoom Modal (Lightbox) */}
      {isZoomOpen && hasValidImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar with Title and Close Button */}
          <div
            className="w-full max-w-2xl flex items-center justify-between text-white pb-3 mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="font-black text-sm sm:text-base">{item.name}</h4>
              <span className="text-xs text-amber-400 font-bold">{currentPrice > 0 ? `${currentPrice} ج.م` : ''}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="إغلاق التكبير"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Image Container */}
          <div
            className="relative w-full max-w-2xl aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl!}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              priority
              className="object-contain bg-stone-950"
            />
          </div>

          <p className="text-xs text-stone-400 mt-4 text-center">
            انقر في أي مكان فارغ للإغلاق ✕
          </p>
        </div>
      )}
    </>
  );
}
