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
  BookOpen,
  Calendar,
  MessageSquare,
  Info,
  ChevronLeft,
} from "lucide-react";
import { siteConfig } from "@/lib/config";
import { useOrderModal } from "@/components/OrderModalContext";

const navLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/menu", label: "المنيو", icon: BookOpen },
  {
    href: "/menu?reserve=true",
    label: "حجز طاولة",
    icon: Calendar,
    badge: "حجز سريع",
  },
  {
    href: "/menu?feedback=true",
    label: "الشكاوى والمقترحات",
    icon: MessageSquare,
    badge: "صوتك يهمنا",
  },
  { href: "/about", label: "عن المطعم", icon: Info },
  { href: "/contact", label: "تواصل معنا", icon: Phone },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { openOrderModal } = useOrderModal();

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

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (pathname === "/menu" && typeof window !== "undefined") {
      if (href.includes("reserve=true")) {
        window.dispatchEvent(new CustomEvent("open-reservation-modal"));
      } else if (href.includes("feedback=true")) {
        window.dispatchEvent(new CustomEvent("open-feedback-modal"));
      }
    }
  };

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
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`px-2.5 lg:px-3.5 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  pathname === link.href
                    ? "bg-primary-600/10 text-primary-600 dark:text-primary-400 font-bold"
                    : "text-stone-600 hover:text-stone-900 dark:text-gray-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => openOrderModal()}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-primary-900/30 whitespace-nowrap shrink-0 inline-flex justify-center select-none cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>اطلب الآن</span>
            </button>
          </div>

          {/* Mobile Menu Button - min 44x44 */}
          <div className="flex items-center gap-2 md:hidden">
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

      {/* Mobile Drawer Navigation - Optimized for Smartphones */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[calc(100dvh-5rem)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/98 dark:bg-dark-950/98 backdrop-blur-xl border-t border-stone-200/80 dark:border-white/10 px-4 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100dvh-5rem)] pb-8 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isCurrent = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] ${
                  isCurrent
                    ? "bg-primary-600/15 text-primary-600 dark:text-primary-400 shadow-xs border border-primary-500/20"
                    : "text-stone-700 hover:text-stone-950 dark:text-gray-200 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isCurrent
                        ? "bg-primary-600 text-white"
                        : "bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{link.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {link.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                      {link.badge}
                    </span>
                  )}
                  <ChevronLeft className="w-4 h-4 text-stone-400" />
                </div>
              </Link>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openOrderModal();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-4 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-primary-900/30 min-h-[52px] active:scale-[0.98] transition-transform cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>اطلب الآن (استلام / توصيل)</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
