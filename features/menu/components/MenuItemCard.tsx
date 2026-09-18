'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GroupedMenuItem } from '@/types/menu';
import { CartLine } from '@/types/orders';
import { Plus, Check, ZoomIn, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import ProductOptionsSheet from './ProductOptionsSheet';

interface MenuItemCardProps {
  item: GroupedMenuItem;
  onAddToCart?: (line: CartLine) => void;
  onOpenOptions?: (item: GroupedMenuItem) => void;
}

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const match = trimmed.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }

  return trimmed;
}

export default function MenuItemCard({
  item,
  onAddToCart,
  onOpenOptions,
}: MenuItemCardProps) {
  const availableVariants = item.variants.filter((v) => v.available);
  const isFullyUnavailable = !item.available || availableVariants.length === 0;
  const isSimpleProduct = availableVariants.length === 1;

  const defaultVariant = availableVariants[0] || item.variants[0];
  const lowestPrice = availableVariants.reduce(
    (min, v) => (v.price < min ? v.price : min),
    defaultVariant?.price || 0
  );
  const hasPriceRange = availableVariants.length > 1;

  // Local state
  const [justAdded, setJustAdded] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const rawImageUrl = item.image_url || item.image || null;
  const imageUrl = normalizeImageUrl(rawImageUrl);
  const hasValidImage = Boolean(imageUrl && !imageError);

  // Simple direct 1-tap add handler
  const handleDirectAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFullyUnavailable || !defaultVariant) return;

    if (isSimpleProduct) {
      if (onAddToCart) {
        onAddToCart({
          variant_id: defaultVariant.id,
          item_name: item.name,
          variant_name: defaultVariant.name,
          price: defaultVariant.price,
          quantity: 1,
        });
      }

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 900);
    } else {
      // Configurable item -> open options sheet
      if (onOpenOptions) {
        onOpenOptions(item);
      } else {
        setIsOptionsOpen(true);
      }
    }
  };

  const handleOpenSheet = () => {
    if (isFullyUnavailable) return;
    if (onOpenOptions) {
      onOpenOptions(item);
    } else {
      setIsOptionsOpen(true);
    }
  };

  return (
    <>
      <div
        className={`group bg-white dark:bg-stone-900 border rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-stone-300 dark:hover:border-stone-700 overflow-hidden ${
          isFullyUnavailable ? 'opacity-50 grayscale select-none' : ''
        } ${
          justAdded
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
            : 'border-stone-200 dark:border-white/10'
        }`}
      >
        {/* Item Image Section */}
        {hasValidImage ? (
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-stone-950 overflow-hidden group/img">
            {/* Skeleton Shimmer while loading */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-stone-850 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-stone-800 animate-ping opacity-25" />
              </div>
            )}

            <Image
              src={imageUrl!}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`object-cover transition-all duration-500 group-hover/img:scale-105 cursor-pointer select-none ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setIsZoomOpen(true)}
            />
            {/* Dark gradient overlay at the bottom of the image for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

            {/* Quick Mobile Zoom Tap Badge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomOpen(true);
              }}
              className="absolute bottom-2 left-2 px-2 py-1 bg-stone-950/75 hover:bg-stone-900 text-white rounded-lg backdrop-blur-md text-[10px] font-bold flex items-center gap-1 transition-all opacity-80 hover:opacity-100 shadow-sm cursor-pointer"
              title="تكبير الصورة"
              aria-label={`تكبير صورة ${item.name}`}
            >
              <ZoomIn className="w-3 h-3 text-gold-400" />
              <span>تكبير</span>
            </button>

            {/* Multiple sizes badge on top corner */}
            {hasPriceRange && !isFullyUnavailable && (
              <div className="absolute top-2.5 right-2.5 bg-stone-900/85 backdrop-blur-md text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm">
                <span>أحجام متعددة</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Card Body */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Badge */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3
                onClick={handleOpenSheet}
                className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug cursor-pointer line-clamp-1"
              >
                {item.name}
              </h3>

              {isFullyUnavailable ? (
                <span className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                  غير متاح
                </span>
              ) : justAdded ? (
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 animate-fade-in">
                  <Check className="w-3 h-3" />
                  <span>تمت الإضافة</span>
                </span>
              ) : null}
            </div>

            {/* Description */}
            {item.description ? (
              <p className="text-stone-500 dark:text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2 min-h-[32px]">
                {item.description}
              </p>
            ) : (
              <div className="min-h-[12px]" />
            )}
          </div>

          {/* Bottom Row: Price & Action CTA */}
          <div className="pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
            {/* Price display */}
            <div className="flex flex-col text-right">
              {hasPriceRange ? (
                <span className="text-[10px] text-stone-400 font-medium">يبدأ من</span>
              ) : null}
              <span className="text-stone-900 dark:text-white font-black text-sm sm:text-base tabular-nums">
                {lowestPrice > 0 ? (
                  <>
                    {lowestPrice}{' '}
                    <small className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase">
                      ج.م
                    </small>
                  </>
                ) : (
                  'حسب الاختيار'
                )}
              </span>
            </div>

            {/* CTA Button */}
            {!isFullyUnavailable ? (
              <div className="flex items-center gap-1.5 shrink-0">
                {/* For simple products: Optional Customize Sheet button */}
                {isSimpleProduct && (
                  <button
                    type="button"
                    onClick={handleOpenSheet}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    title="تخصيص الملاحظات والكمية"
                    aria-label={`تخصيص طلب ${item.name}`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                )}

                {/* Primary Action Button (44px min target) */}
                <button
                  type="button"
                  onClick={handleDirectAdd}
                  className={`btn-primary py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[42px] cursor-pointer ${
                    justAdded ? 'bg-emerald-600 border-emerald-600' : ''
                  }`}
                  aria-label={
                    isSimpleProduct
                      ? `أضف ${item.name} للسلة`
                      : `اختر حجم وتفاصيل ${item.name}`
                  }
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تمت</span>
                    </>
                  ) : isSimpleProduct ? (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>أضف للطلب</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                      <span>اختر الحجم</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled
                className="py-1.5 px-3 bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 rounded-xl text-xs font-bold cursor-not-allowed min-h-[40px]"
              >
                نفدت الكمية
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Product Options Sheet */}
      <ProductOptionsSheet
        isOpen={isOptionsOpen}
        item={item}
        onClose={() => setIsOptionsOpen(false)}
        onAddToCart={(line) => {
          if (onAddToCart) onAddToCart(line);
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 900);
        }}
      />

      {/* Lightbox Zoom Modal */}
      {isZoomOpen && hasValidImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl flex items-center justify-between text-white pb-3 mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="font-bold text-base sm:text-lg">{item.name}</h4>
              <span className="text-xs text-gold-400 font-bold">
                {lowestPrice > 0 ? `${lowestPrice} ج.م` : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
          <p className="text-xs text-stone-400 mt-3 text-center">
            انقر في أي مكان فارغ للإغلاق ✕
          </p>
        </div>
      )}
    </>
  );
}
