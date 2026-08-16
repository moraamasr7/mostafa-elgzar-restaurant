"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowRight, Phone, Sparkles, ZoomIn, Download, X, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import MenuCard from "@/components/MenuCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import { siteConfig } from "@/lib/config";
import { fetchPublicMenu } from "@/lib/menu";
import { MenuItem, MenuCategory } from "@/types/menu";
import { useOrderModal } from "@/components/OrderModalContext";

const paperImages = ["/images/menu1.jpg", "/images/menu2.jpg"];

export default function MenuPage() {
  const [menuType, setMenuType] = useState<"paper" | "interactive">("paper");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right">("left");
  
  // Authoritative Menu Data Layer state
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const { openOrderModal } = useOrderModal();

  useEffect(() => {
    let isMounted = true;
    const loadMenu = async () => {
      setIsLoading(true);
      const result = await fetchPublicMenu();
      if (isMounted) {
        setCategories(result.categories);
        setItems(result.items);
        setIsFallback(result.isFallback);
        setIsLoading(false);
      }
    };
    loadMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  // Touch tracking for swipe gestures
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchCurrentX === null) return;
    const differenceX = touchStartX - touchCurrentX;
    const minSwipeDistance = 50; // minimum distance in px to trigger swipe

    if (differenceX > minSwipeDistance) {
      // Swiped Left (Next Page)
      setSwipeDirection("left");
      setLightboxIndex((prev) => (prev === null ? null : prev === 0 ? 1 : 0));
    } else if (differenceX < -minSwipeDistance) {
      // Swiped Right (Previous Page)
      setSwipeDirection("right");
      setLightboxIndex((prev) => (prev === null ? null : prev === 0 ? 1 : 0));
    }

    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  const navigateLightbox = (direction: "next" | "prev") => {
    setSwipeDirection(direction === "next" ? "left" : "right");
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? 1 : 0;
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 rounded-full px-4 py-2 mb-6">
            <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-primary-700 dark:text-primary-300 text-sm font-medium">قائمة الطعام</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            منيو <span className="text-gradient">الجزار</span> الكامل
          </h1>
          <p className="text-stone-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            اختر ما يناسبك لتصفحه؛ المنيو الورقي الأصلي المصور، أو المنيو التفاعلي المباشر.
          </p>
        </motion.div>

        {/* Menu View Switcher Tab Toggle */}
        <div className="flex justify-center mb-10 print:hidden">
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 p-1.5 rounded-2xl shadow-sm">
            <button
              onClick={() => setMenuType("paper")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                menuType === "paper"
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/10"
                  : "text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>المنيو الورقي</span>
            </button>
            <button
              onClick={() => setMenuType("interactive")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                menuType === "interactive"
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/10"
                  : "text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>المنيو الإلكتروني</span>
            </button>
          </div>
        </div>

        {/* Dynamic Views Rendering */}
        <AnimatePresence mode="wait">
          {menuType === "paper" ? (
            /* PAPER SCANNED MENU VIEW */
            <motion.div
              key="paper-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                {/* Page 1 Card */}
                <div
                  className="glass-card p-4 flex flex-col items-center gap-4 group cursor-zoom-in"
                  onClick={() => setLightboxIndex(0)}
                >
                  <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-white/5 bg-stone-950 shadow-md">
                    <img
                      src="/images/menu1.jpg"
                      alt="منيو مطعم الجزار - الصفحة الأولى"
                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm">
                      <ZoomIn className="w-5 h-5 text-primary-500" />
                      <span>اضغط لتكبير  </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full px-2">
                    <span className="text-lg font-bold text-stone-900 dark:text-white">الصفحة الأولى</span>
                    <a
                      href="/images/menu1.jpg"
                      download="mostafa-elgzar-menu-1.jpg"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل</span>
                    </a>
                  </div>
                </div>

                {/* Page 2 Card */}
                <div
                  className="glass-card p-4 flex flex-col items-center gap-4 group cursor-zoom-in"
                  onClick={() => setLightboxIndex(1)}
                >
                  <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-white/5 bg-stone-950 shadow-md">
                    <img
                      src="/images/menu2.jpg"
                      alt="منيو مطعم الجزار - الصفحة الثانية"
                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm">
                      <ZoomIn className="w-5 h-5 text-primary-500" />
                      <span>اضغط لتكبير  </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full px-2">
                    <span className="text-lg font-bold text-stone-900 dark:text-white">الصفحة الثانية</span>
                    <a
                      href="/images/menu2.jpg"
                      download="mostafa-elgzar-menu-2.jpg"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* INTERACTIVE DIGITAL MENU VIEW */
            <motion.div
              key="interactive-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {/* Search Bar */}
              <div className="mb-8">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>

              {/* Online Ordering Integration Banner */}
              <div className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-primary-600/10 to-gold-500/10 border border-primary-500/20 dark:border-primary-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div className="space-y-1">
                  <h4 className="text-stone-900 dark:text-white font-bold text-base sm:text-lg">
                    تفضل الطلب للمنزل أو الاستلام من الفرع؟ 🚀
                  </h4>
                  <p className="text-stone-600 dark:text-gray-400 text-xs sm:text-sm">
                    تصفح أطباقنا المتاحة واطلب مباشرة أو اتصل بنا هاتفياً
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 justify-center">
                  <button
                    type="button"
                    onClick={() => openOrderModal()}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-primary-500/20 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>طلب أونلاين (استلام / توصيل)</span>
                  </button>
                  <a
                    href={siteConfig.telUrl}
                    className="bg-stone-200 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 text-stone-850 dark:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{siteConfig.phone}</span>
                  </a>
                </div>
              </div>

              {/* Sticky Category Filter */}
              <div className="sticky top-20 z-40 bg-stone-50/95 dark:bg-dark-950/95 backdrop-blur-md py-4 border-b border-stone-200/50 dark:border-white/5 mb-12 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-colors duration-300 animate-fadeIn">
                <CategoryFilter
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  categories={categories.length > 0 ? categories : undefined}
                />
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-20">
                  <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                  <p className="text-stone-500 dark:text-gray-400 font-medium">جاري تحميل قائمه الطعام المحدثة...</p>
                </div>
              ) : (
                <>
                  {/* Results Count & Source Info */}
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-stone-600 dark:text-gray-400 text-sm font-medium">
                      {filteredItems.length} صنف متاح
                    </p>
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>الرئيسية</span>
                    </Link>
                  </div>

                  {/* Menu Grid */}
                  {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredItems.map((item, index) => (
                        <MenuCard key={item.id} item={item} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-stone-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-stone-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">لا توجد أطباق مطابقة</h3>
                      <p className="text-stone-500 dark:text-gray-400">جرب البحث بكلمات أخرى أو اختر تصنيفاً آخر</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox for zooming Scanned Paper Menu pages with Swipe and Navigation controls */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none touch-none"
            onClick={() => setLightboxIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Lightbox Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-50">
              <span className="bg-stone-900/85 border border-white/10 px-4 py-2 rounded-full text-sm font-bold text-gray-300">
                الصفحة {lightboxIndex + 1} من {paperImages.length}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={paperImages[lightboxIndex]}
                  download={`mostafa-elgzar-menu-${lightboxIndex + 1}.jpg`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-stone-900/80 hover:bg-stone-800 text-white p-3 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10 hover:border-primary-500/50"
                  title="تحميل الصورة"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="bg-stone-900/80 hover:bg-stone-850 text-white w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10 hover:scale-105 active:scale-95 z-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Lightbox Image View with Motion Animation */}
            <div
              className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  src={paperImages[lightboxIndex]}
                  alt={`منيو ورقي مكبر صفحة ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, x: swipeDirection === "left" ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: swipeDirection === "left" ? -100 : 100 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none pointer-events-none"
                />
              </AnimatePresence>

              {/* Desktop Left/Right Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("prev");
                }}
                className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 bg-stone-900/80 hover:bg-stone-800 text-white w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10 z-50 hover:scale-105 hover:border-primary-500/50"
                title="الصفحة السابقة"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("next");
                }}
                className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 bg-stone-900/80 hover:bg-stone-800 text-white w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10 z-50 hover:scale-105 hover:border-primary-500/50"
                title="الصفحة التالية"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Swipe Hint Indicator */}
            <div className="absolute bottom-6 text-center z-50 pointer-events-none">
              <span className="bg-stone-900/80 border border-white/10 text-stone-300 text-xs px-4 py-2 rounded-full backdrop-blur-sm shadow-md">
                اسحب يميناً أو يساراً للتنقل بين صفحات المنيو
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
