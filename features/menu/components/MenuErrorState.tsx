'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Phone, BookOpen } from 'lucide-react';
import { siteConfig } from '@/lib/config';

interface MenuErrorStateProps {
  onRetry: () => void;
  onViewPaperMenu?: () => void;
  errorMessage?: string;
}

export default function MenuErrorState({
  onRetry,
  onViewPaperMenu,
  errorMessage,
}: MenuErrorStateProps) {
  return (
    <div className="max-w-xl mx-auto my-12 p-8 glass-card rounded-3xl border border-primary-500/20 text-center shadow-xl space-y-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary-600/10 dark:bg-primary-600/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto ring-8 ring-primary-500/5">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
          المنيو الإلكتروني قيد التحديث
        </h3>
        <p className="text-stone-600 dark:text-gray-400 text-sm leading-relaxed">
          نعمل على مزامنة أحدث أسعار وتوافر وجبات مطعم مصطفى الجزار الآن.
          نعتذر عن هذا التوقف المؤقت.
        </p>
        {errorMessage && (
          <p className="text-xs text-stone-400 dark:text-stone-500 font-mono pt-1">
            ({errorMessage})
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="btn-primary text-sm px-6 py-3 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </button>

        {onViewPaperMenu && (
          <button
            type="button"
            onClick={onViewPaperMenu}
            className="btn-gold text-sm px-6 py-3 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>تصفح المنيو الورقي المصور</span>
          </button>
        )}
      </div>

      <div className="pt-6 border-t border-stone-200 dark:border-white/10 space-y-2">
        <span className="text-xs text-stone-500 dark:text-gray-400 block font-medium">
          يمكنك الطلب والاستفسار فوراً عبر الهاتف:
        </span>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href={siteConfig.telUrl}
            className="inline-flex items-center gap-2 text-stone-900 dark:text-white font-bold hover:text-primary-600 text-sm"
            dir="ltr"
          >
            <Phone className="w-4 h-4 text-primary-500" />
            <span>{siteConfig.phone}</span>
          </a>
          <span className="text-stone-300 dark:text-stone-700">|</span>
          <a
            href={siteConfig.telUrlSecondary}
            className="inline-flex items-center gap-2 text-stone-900 dark:text-white font-bold hover:text-primary-600 text-sm"
            dir="ltr"
          >
            <Phone className="w-4 h-4 text-primary-500" />
            <span>{siteConfig.phoneSecondary}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

