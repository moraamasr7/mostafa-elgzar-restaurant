'use client';

import React, { useRef, useEffect } from 'react';
import { GroupedCategory } from '@/types/menu';

interface CategoryRailProps {
  categories: GroupedCategory[];
  activeCategoryId: string;
  totalItemsCount: number;
  onSelectCategory: (id: string) => void;
}

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes('مشوي') || lower.includes('كباب') || lower.includes('كفتة') || lower.includes('لحم')) return '🔥';
  if (lower.includes('كبد') || lower.includes('مخ') || lower.includes('فشة') || lower.includes('طحال') || lower.includes('حرش')) return '🥩';
  if (lower.includes('طاجن') || lower.includes('طواجن')) return '🥘';
  if (lower.includes('وجب') || lower.includes('طبق')) return '🍱';
  if (lower.includes('ساندوتش') || lower.includes('سندوتش') || lower.includes('عيش')) return '🥪';
  if (lower.includes('مقبل') || lower.includes('سلط') || lower.includes('شورب')) return '🥗';
  if (lower.includes('إضاف') || lower.includes('بطاطس') || lower.includes('أرز')) return '🍟';
  if (lower.includes('مشروب') || lower.includes('عصير') || lower.includes('كانز') || lower.includes('بيبسي')) return '🥤';
  if (lower.includes('حلو') || lower.includes('تحلية')) return '🍯';
  return '🍽️';
}

export default function CategoryRail({
  categories,
  activeCategoryId,
  totalItemsCount,
  onSelectCategory,
}: CategoryRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Smoothly center the active category tab horizontally within the rail
  useEffect(() => {
    if (activeBtnRef.current && railRef.current) {
      const container = railRef.current;
      const button = activeBtnRef.current;
      const scrollLeft =
        button.offsetLeft -
        container.clientWidth / 2 +
        button.clientWidth / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeCategoryId]);

  if (!categories || categories.length === 0) return null;

  return (
    <nav
      className="sticky top-16 sm:top-20 z-30 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md py-2.5 border-b border-stone-200/60 dark:border-stone-800/80 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all"
      aria-label="تصنيفات قائمة الطعام"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto relative">
        {/* Soft edge fades on mobile */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-stone-50 dark:from-stone-950 to-transparent z-10 sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-stone-50 dark:from-stone-950 to-transparent z-10 sm:hidden" />

        {/* Scrollable Container */}
        <div
          ref={railRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1 select-none scroll-smooth touch-pan-x"
          role="tablist"
        >
          {/* "All" Category Tab */}
          <button
            ref={activeCategoryId === 'all' ? activeBtnRef : null}
            type="button"
            role="tab"
            aria-selected={activeCategoryId === 'all'}
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border shrink-0 min-h-[42px] cursor-pointer ${
              activeCategoryId === 'all'
                ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-700'
            }`}
          >
            <span aria-hidden>🍽️</span>
            <span>الكل</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums font-bold ${
                activeCategoryId === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {totalItemsCount}
            </span>
          </button>

          {/* Dynamic Categories Tabs from Supabase Data */}
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const icon = cat.icon || getCategoryIcon(cat.name);
            const count = cat.items ? cat.items.length : 0;

            return (
              <button
                key={cat.id}
                ref={isActive ? activeBtnRef : null}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border shrink-0 min-h-[42px] cursor-pointer ${
                  isActive
                    ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-700'
                }`}
              >
                <span aria-hidden>{icon}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
