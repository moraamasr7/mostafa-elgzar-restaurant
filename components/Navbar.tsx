"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  ShoppingBag,
  Home,
  Sparkles,
  BookOpen,
  Calendar,
  MessageSquare,
  Info,
  ChevronLeft,
} from "lucide-react";
import { siteConfig } from "@/lib/config";
import LiveStoreBadge from "@/features/menu/components/LiveStoreBadge";
import { usePaperMenu } from "@/features/menu/context/PaperMenuContext";
import { useReservation } from "@/features/reservations/context/ReservationContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { openPaperMenu } = usePaperMenu();
  const { openReservationModal } = useReservation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile navigation on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Do not render public customer navigation on admin operational routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-dark-950/95 backdrop-blur-lg shadow-md dark:shadow-xl border-b border-stone-200/50 dark:border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo.png"
              alt={`${siteConfig.name} - Mostafa Elgzar`}
              className="w-12 h-12 object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-stone-900 dark:text-white leading-none">
                {siteConfig.name}
              </h1>
              <p className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold mt-1">{siteConfig.subtitle}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                pathname === "/"
                  ? "bg-primary-600/10 text-primary-600 dark:text-primary-400 font-bold"
                  : "text-stone-600 hover:text-stone-900 dark:text-gray-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5"
              }`}
            >
              الرئيسية
            </Link>

            {/* Paper Menu Trigger for "المنيو" Link in Header */}
            <button
              type="button"
              onClick={openPaperMenu}
              className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap text-stone-600 hover:text-stone-900 dark:text-gray-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer"
            >
              المنيو
            </button>

            {/* Direct Reservation Flow */}
            <button
              type="button"
              onClick={() => openReservationModal('create')}
              className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap text-stone-600 hover:text-stone-900 dark:text-gray-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer"
            >
              حجز طاولة
            </button>

            <Link
              href="/about"
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                pathname === "/about"
                  ? "bg-primary-600/10 text-primary-600 dark:text-primary-400 font-bold"
                  : "text-stone-600 hover:text-stone-900 dark:text-gray-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5"
              }`}
            >
              عن المطعم
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                pathname === "/contact"
                  ? "bg-primary-600/10 text-primary-600 dark:text-primary-400 font-bold"
                  : "text-stone-600 hover:text-stone-900 dark:text-gray-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5"
              }`}
            >
              تواصل معنا
            </Link>
          </div>

          {/* Desktop Right: Live Status + Order Now CTA Button (Points directly to /menu) */}
          <div className="hidden lg:flex items-center gap-3">
            <LiveStoreBadge />
            <Link
              href="/menu"
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-primary-900/30 whitespace-nowrap shrink-0 inline-flex justify-center select-none cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>اطلب الآن</span>
            </Link>
          </div>

          {/* Mobile Right: Live Status + Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <LiveStoreBadge />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة الرئيسية"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation - Clear Separation of Concerns */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[calc(100dvh-5rem)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/98 dark:bg-dark-950/98 backdrop-blur-xl border-t border-stone-200/80 dark:border-white/10 px-4 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100dvh-5rem)] pb-8 shadow-2xl">
          {/* 1. Homepage */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] ${
              pathname === "/"
                ? "bg-primary-600/15 text-primary-600 dark:text-primary-400 shadow-xs border border-primary-500/20"
                : "text-stone-700 hover:text-stone-950 dark:text-gray-200 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-gray-300">
                <Home className="w-4 h-4" />
              </div>
              <span>الرئيسية</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-stone-400" />
          </Link>

          {/* 2. Interactive Menu (Direct Ordering) */}
          <Link
            href="/menu"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] ${
              pathname === "/menu"
                ? "bg-primary-600/15 text-primary-600 dark:text-primary-400 shadow-xs border border-primary-500/20"
                : "text-stone-700 hover:text-stone-950 dark:text-gray-200 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>المنيو الإلكتروني (اطلب أونلاين)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/30">
                طلب وتوصيل
              </span>
              <ChevronLeft className="w-4 h-4 text-stone-400" />
            </div>
          </Link>

          {/* 3. Paper Menu Viewer Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openPaperMenu();
            }}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] text-stone-700 hover:text-stone-950 dark:text-gray-200 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5 cursor-pointer text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gold-500/15 text-gold-600 dark:text-gold-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>المنيو الورقي المصور</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                مصور بالأسعار
              </span>
              <ChevronLeft className="w-4 h-4 text-stone-400" />
            </div>
          </button>

          {/* 4. Table Reservation Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openReservationModal('create');
            }}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] text-stone-700 hover:text-stone-950 dark:text-gray-200 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5 cursor-pointer text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <span>حجز طاولة بالمطعم</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                حجز فوري
              </span>
              <ChevronLeft className="w-4 h-4 text-stone-400" />
            </div>
          </button>

          {/* 5. Feedback */}
          <Link
            href="/contact?feedback=true"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] text-stone-700 hover:text-stone-950 dark:text-gray-200 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-gray-300">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span>الشكاوى والمقترحات</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-stone-400" />
          </Link>

          {/* 6. About */}
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] text-stone-700 hover:text-stone-950 dark:text-gray-200 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-gray-300">
                <Info className="w-4 h-4" />
              </div>
              <span>عن المطعم</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-stone-400" />
          </Link>

          {/* 7. Contact */}
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] text-stone-700 hover:text-stone-950 dark:text-gray-200 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
              </div>
              <span>تواصل معنا</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-stone-400" />
          </Link>

          {/* Mobile Bottom Quick Order CTA */}
          <div className="pt-2">
            <Link
              href="/menu"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-4 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-primary-900/30 min-h-[52px] active:scale-[0.98] transition-transform cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>تصفح المنيو واطلب الآن</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
