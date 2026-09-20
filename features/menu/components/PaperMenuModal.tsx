'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { getPaperMenuImages } from '@/features/menu/queries/get-paper-menu.query';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

interface PaperMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaperMenuModal({ isOpen, onClose }: PaperMenuModalProps) {
  useScrollLock(isOpen);

  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right'>('left');

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPaperMenuImages();
      setImages(result.images);
      if (result.error && !result.isFallback) {
        setError(result.error);
      }
    } catch {
      setError('تعذر تحميل صور المنيو الورقي حالياً.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setCurrentIndex(0);
      setIsZoomed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handlePrev();
      if (e.key === 'ArrowLeft') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, currentIndex]);

  const handleNext = () => {
    if (images.length === 0) return;
    setSwipeDirection('left');
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    if (images.length === 0) return;
    setSwipeDirection('right');
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 select-none dir-rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-stone-950/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] z-10 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-950/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>المنيو الورقي المصور</span>
                  {images.length > 0 && (
                    <span className="text-xs font-normal text-stone-400">
                      (صفحة {currentIndex + 1} من {images.length})
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/menu"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>المنيو التفاعلي والطلب</span>
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors min-w-[36px] min-h-[36px] cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Viewer Body */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 min-h-[350px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-stone-400">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                <span className="text-xs font-bold">جاري تحميل صور المنيو عالية الدقة...</span>
              </div>
            ) : error || images.length === 0 ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-xs text-stone-300 font-bold">{error || 'لم يتم العثور على صور المنيو'}</p>
                <button
                  type="button"
                  onClick={fetchImages}
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-500 transition-all inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center overflow-auto">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={`منيو مطعم الجزار صفحة ${currentIndex + 1}`}
                    initial={{ opacity: 0, x: swipeDirection === 'left' ? 60 : -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: swipeDirection === 'left' ? -60 : 60 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsZoomed((prev) => !prev)}
                    className={`max-h-[70dvh] object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform duration-300 ${
                      isZoomed ? 'scale-125 sm:scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                    }`}
                  />
                </AnimatePresence>

                {/* Right / Left Navigation Arrow Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-stone-900/80 hover:bg-primary-600 text-white flex items-center justify-center shadow-xl border border-white/10 transition-all z-20 cursor-pointer active:scale-95"
                      title="الصفحة السابقة"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-stone-900/80 hover:bg-primary-600 text-white flex items-center justify-center shadow-xl border border-white/10 transition-all z-20 cursor-pointer active:scale-95"
                      title="الصفحة التالية"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls Bar */}
          <div className="px-4 py-3 border-t border-stone-800 bg-stone-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Zoom & Download Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-4 h-4 text-amber-400" />
                    <span>تصغير</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4 text-emerald-400" />
                    <span>تكبير الصورة</span>
                  </>
                )}
              </button>

              {images[currentIndex] && (
                <a
                  href={images[currentIndex]}
                  download={`mostafa-elgzar-menu-${currentIndex + 1}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-primary-400" />
                  <span>تحميل الصورة</span>
                </a>
              )}
            </div>

            {/* Mobile Link to Interactive Order */}
            <Link
              href="/menu"
              className="sm:hidden px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>المنيو التفاعلي والطلب</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
