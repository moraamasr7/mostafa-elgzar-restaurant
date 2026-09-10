"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ArrowRight,
  Phone,
  Sparkles,
  ZoomIn,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { siteConfig } from "@/lib/config";
import { getLiveMenu } from "@/features/menu/queries/get-menu.query";
import { GroupedCategory } from "@/types/menu";
import { supabase } from "@/lib/supabase/client";
import { STATUS_UI_CONFIG, OrderStatus } from "@/types/orders";
import MenuItemCard from "@/features/menu/components/MenuItemCard";
import MenuErrorState from "@/features/menu/components/MenuErrorState";
import { useCart } from "@/features/cart/context/CartContext";
import { CustomerFeedbackModal } from "@/features/feedback/components/CustomerFeedbackModal";
import { TableReservationModal } from "@/features/reservations/components/TableReservationModal";
import { useScrollLock } from "@/lib/hooks/useScrollLock";

const paperImages = ["/images/menu1.jpg", "/images/menu2.jpg"];

export default function MenuPage() {
  const [menuType, setMenuType] = useState<"paper" | "interactive">("interactive");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right">("left");

  useScrollLock(lightboxIndex !== null);

  // Live Menu Data Layer state (Single Source of Truth: Supabase v_full_menu)
  const [categories, setCategories] = useState<GroupedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { addToCart } = useCart();

  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Active Customer Order Tracking state
  const [activeOrder, setActiveOrder] = useState<{
    order_id: string;
    order_number: number;
    tracking_token: string | null;
    total_amount?: number;
    status?: OrderStatus;
    created_at?: string;
  } | null>(null);

  const loadMenu = async () => {
    setIsLoading(true);
    setFetchError(null);
    const result = await getLiveMenu();
    if (result.error) {
      setFetchError(result.error);
    } else {
      setCategories(result.categories);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMenu();

    const checkModalParams = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("type") === "paper") {
          setMenuType("paper");
        } else if (params.get("type") === "interactive") {
          setMenuType("interactive");
        }

        if (params.get("reserve") === "true") {
          setIsReservationOpen(true);
        } else if (params.get("feedback") === "true") {
          setIsFeedbackOpen(true);
        }
      }
    };

    checkModalParams();

    // Check for active customer order
    const checkActiveOrder = async () => {
      try {
        const stored = localStorage.getItem("elgzar_active_order");
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (!parsed || !parsed.order_id) return;

        // Check created_at (keep active order for 24 hours max)
        if (parsed.created_at) {
          const ageHours = (Date.now() - new Date(parsed.created_at).getTime()) / (1000 * 60 * 60);
          if (ageHours > 24) {
            localStorage.removeItem("elgzar_active_order");
            return;
          }
        }

        setActiveOrder(parsed);

        // Fetch current status from Supabase
        if (parsed.tracking_token) {
          const { data } = await supabase.rpc("get_customer_order_tracking", {
            p_order_id: parsed.order_id,
            p_tracking_token: parsed.tracking_token,
          });
          if (data && Array.isArray(data) && data.length > 0) {
            const currentStatus = data[0].status as OrderStatus;
            setActiveOrder((prev) => (prev ? { ...prev, status: currentStatus } : null));
            if (currentStatus === "delivered" || currentStatus === "completed" || currentStatus === "cancelled") {
              // Can still view, but after 6 hours clear
            }
          }
        } else {
          const { data } = await supabase
            .from("orders")
            .select("status")
            .eq("id", parsed.order_id)
            .maybeSingle();
          if (data && data.status) {
            setActiveOrder((prev) => (prev ? { ...prev, status: data.status as OrderStatus } : null));
          }
        }
      } catch (err) {
        console.warn("Active order check failed", err);
      }
    };

    checkActiveOrder();

    const onOpenReservation = () => setIsReservationOpen(true);
    const onOpenFeedback = () => setIsFeedbackOpen(true);
    const onSwitchMenuType = (e: Event) => {
      const customEvent = e as CustomEvent<"paper" | "interactive">;
      if (customEvent.detail) {
        setMenuType(customEvent.detail);
      }
    };

    window.addEventListener("open-reservation-modal", onOpenReservation);
    window.addEventListener("open-feedback-modal", onOpenFeedback);
    window.addEventListener("switch-menu-type", onSwitchMenuType);
    window.addEventListener("popstate", checkModalParams);

    return () => {
      window.removeEventListener("open-reservation-modal", onOpenReservation);
      window.removeEventListener("open-feedback-modal", onOpenFeedback);
      window.removeEventListener("switch-menu-type", onSwitchMenuType);
      window.removeEventListener("popstate", checkModalParams);
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
    const minSwipeDistance = 50;

    if (differenceX > minSwipeDistance) {
      setSwipeDirection("left");
      setLightboxIndex((prev) => (prev === null ? null : prev === 0 ? 1 : 0));
    } else if (differenceX < -minSwipeDistance) {
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

  const totalItemsCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories
      .map((cat) => {
        if (activeCategoryId !== "all" && cat.id !== activeCategoryId) {
          return null;
        }

        const items = cat.items.filter((item) => {
          if (!query) return true;
          return (
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
          );
        });

        if (items.length === 0) return null;

        return {
          ...cat,
          items,
        };
      })
      .filter((cat): cat is GroupedCategory => cat !== null);
  }, [categories, activeCategoryId, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24 pb-36 sm:pb-28 transition-colors duration-300">
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
            <span className="text-primary-700 dark:text-primary-300 text-sm font-medium">
              قائمة الطعام
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            منيو <span className="text-gradient">الجزار</span> الكامل
          </h1>
          <p className="text-stone-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            أصل الأكل الحرش البلدي المصري الأصيل — تصفح أصنافنا واطلب مباشرة لاستلام طازج وسريع.
          </p>
        </motion.div>

        {/* Menu View Switcher Tab Toggle */}
        <div className="flex justify-center mb-10 print:hidden">
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 p-1.5 rounded-2xl shadow-sm">
            <button
              onClick={() => setMenuType("interactive")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                menuType === "interactive"
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/10"
                  : "text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>المنيو الإلكتروني التفاعلي</span>
            </button>
            <button
              onClick={() => setMenuType("paper")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                menuType === "paper"
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/10"
                  : "text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>المنيو الورقي المصور</span>
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
                  className="glass-card p-4 flex flex-col items-center gap-4 group cursor-zoom-in rounded-3xl"
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
                      <span>اضغط لتكبير الصفحة</span>
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
                  className="glass-card p-4 flex flex-col items-center gap-4 group cursor-zoom-in rounded-3xl"
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
                      <span>اضغط لتكبير الصفحة</span>
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
              <div className="mb-6 max-w-3xl mx-auto">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>

              {/* Direct Telephone Quick Order Bar & Active Order Live Tracker */}
              {activeOrder ? (
                <div className="mb-8 p-4 bg-gradient-to-r from-amber-500/15 via-gold-500/10 to-primary-600/15 border border-amber-500/30 dark:border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right max-w-4xl mx-auto shadow-md shadow-amber-500/5 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                      {activeOrder.status ? STATUS_UI_CONFIG[activeOrder.status]?.icon || '🛵' : '🛵'}
                    </div>
                    <div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-white">
                          لديك طلب جاري: طلب #{activeOrder.order_number}
                        </span>
                        {activeOrder.status && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                              STATUS_UI_CONFIG[activeOrder.status]?.bgColor || 'bg-amber-500/10'
                            } ${
                              STATUS_UI_CONFIG[activeOrder.status]?.borderColor || 'border-amber-500/20'
                            } ${
                              STATUS_UI_CONFIG[activeOrder.status]?.color || 'text-amber-400'
                            }`}
                          >
                            {STATUS_UI_CONFIG[activeOrder.status]?.label || activeOrder.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-gray-400 mt-0.5">
                        يمكنك متابعة حالة إعداد طلبك والتوصيل خطوة بخطوة في أي وقت.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    <Link
                      href={
                        activeOrder.tracking_token
                          ? `/order/${activeOrder.order_id}?token=${activeOrder.tracking_token}`
                          : `/order/${activeOrder.order_id}`
                      }
                      className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-400 hover:to-primary-500 text-stone-950 font-black px-4 py-2 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
                    >
                      <span>تتبع طلبك الآن 📍</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل تريد إخفاء تنبيه التتبع من القائمة؟ (لن يتم إلغاء الطلب)')) {
                          localStorage.removeItem('elgzar_active_order');
                          setActiveOrder(null);
                        }
                      }}
                      className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
                      title="إخفاء التنبيه"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-4 bg-gradient-to-r from-primary-600/10 via-gold-500/10 to-primary-600/10 border border-primary-500/20 dark:border-primary-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right max-w-4xl mx-auto">
                  <div className="text-xs sm:text-sm text-stone-700 dark:text-gray-300 font-medium">
                    🚀 <strong className="text-stone-900 dark:text-white">أصل الأكل الحرش بالمطرية:</strong> أضف وجباتك للسلة واطلب أو اتصل بنا مباشرة:
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={siteConfig.telUrl}
                      className="inline-flex items-center gap-1.5 bg-white dark:bg-white/10 hover:bg-stone-50 dark:hover:bg-white/20 text-stone-900 dark:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-stone-200 dark:border-white/10 shadow-xs"
                      dir="ltr"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary-500" />
                      <span>{siteConfig.phone}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Sticky Category Filter Tabs */}
              {categories.length > 0 && !fetchError && (
                <div className="sticky top-20 z-30 bg-stone-50/95 dark:bg-dark-950/95 backdrop-blur-md py-3 border-b border-stone-200/50 dark:border-white/5 mb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  <div className="relative max-w-4xl mx-auto">
                    {/* Left/Right scroll indicators on small screens */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-stone-50 dark:from-dark-950 to-transparent z-10 sm:hidden" />
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-stone-50 dark:from-dark-950 to-transparent z-10 sm:hidden" />

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1" dir="rtl">
                      <button
                        type="button"
                        onClick={() => setActiveCategoryId("all")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border shrink-0 min-h-[40px] ${
                          activeCategoryId === "all"
                            ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20"
                            : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white"
                        }`}
                      >
                        <span>🍽️ الكل</span>
                        <span className="text-[10px] bg-black/10 dark:bg-white/10 px-1.5 py-0.2 rounded-md tabular-nums">
                          {totalItemsCount}
                        </span>
                      </button>

                      {categories.map((cat) => {
                        const isActive = activeCategoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategoryId(cat.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border shrink-0 min-h-[40px] ${
                              isActive
                                ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20"
                                : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white"
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] bg-black/10 dark:bg-white/10 px-1.5 py-0.2 rounded-md tabular-nums">
                              {cat.items.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-20">
                  <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                  <p className="text-stone-500 dark:text-gray-400 font-bold">جاري تحميل قائمة الطعام المباشرة...</p>
                </div>
              ) : fetchError ? (
                /* STRICT ERROR STATE - NO AUTOMATIC FALLBACK */
                <MenuErrorState
                  onRetry={loadMenu}
                  onViewPaperMenu={() => setMenuType("paper")}
                  errorMessage={fetchError}
                />
              ) : (
                /* Live Menu Grid by Category */
                <div className="space-y-10 max-w-6xl mx-auto">
                  {filteredCategories.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-3xl max-w-md mx-auto p-8 space-y-3">
                      <span className="text-4xl block">🔍</span>
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white">لا توجد أطباق مطابقة</h3>
                      <p className="text-xs text-stone-500 dark:text-gray-400">
                        جرب البحث بكلمات أخرى أو اختر تصنيفاً آخر.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategoryId("all");
                          setSearchQuery("");
                        }}
                        className="btn-primary text-xs px-4 py-2 mt-2"
                      >
                        عرض كل الأطباق
                      </button>
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <section key={category.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                            <span className="text-primary-600">🥩</span>
                            <span>{category.name}</span>
                          </h2>
                          <div className="flex-1 h-px bg-stone-200 dark:bg-white/10" />
                          <span className="text-xs font-semibold text-stone-400 tabular-nums">
                            {category.items.length} أصناف
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {category.items.map((item) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              onAddToCart={addToCart}
                            />
                          ))}
                        </div>
                      </section>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanned Paper Lightbox View */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none touch-none"
            onClick={() => setLightboxIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-50">
              <span className="bg-stone-900/85 border border-white/10 px-4 py-2 rounded-full text-sm font-bold text-gray-300">
                الصفحة {lightboxIndex + 1} من {paperImages.length}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={paperImages[lightboxIndex]}
                  download={`mostafa-elgzar-menu-${lightboxIndex + 1}.jpg`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-stone-900/80 hover:bg-stone-800 text-white p-3 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10"
                  title="تحميل الصورة"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="bg-stone-900/80 hover:bg-stone-850 text-white w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("prev");
                }}
                className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 bg-stone-900/80 hover:bg-stone-800 text-white w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10 z-50"
                title="الصفحة السابقة"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("next");
                }}
                className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 bg-stone-900/80 hover:bg-stone-800 text-white w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10 z-50"
                title="الصفحة التالية"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Reservation & Customer Feedback Modals */}
      <TableReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />
      <CustomerFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
