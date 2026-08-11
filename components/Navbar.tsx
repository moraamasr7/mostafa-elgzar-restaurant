"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/menu", label: "المنيو" },
  { href: "/about", label: "عن المطعم" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-dark-950/95 backdrop-blur-lg shadow-md dark:shadow-xl border-b border-stone-200/50 dark:border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-gold-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-stone-900 dark:text-white leading-tight">
                مصطفى <span className="text-primary-500">الجزار</span>
              </h1>
              <p className="text-xs text-gold-600 dark:text-gold-400">أصل الأكل الحرش</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? "bg-primary-600/10 text-primary-600 dark:text-primary-400"
                    : "text-stone-600 hover:text-stone-900 dark:text-gray-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA & Theme Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-gray-300 hover:text-stone-900 dark:hover:text-white transition-all duration-300"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-gold-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary-600" />
              )}
            </button>
            <a
              href="tel:01122339739"
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-primary-900/30"
            >
              <Phone className="w-4 h-4" />
              <span>اطلب الآن</span>
            </a>
          </div>

          {/* Mobile Theme & Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-gray-300 hover:text-stone-900 dark:hover:text-white transition-all"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-gold-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary-600" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 dark:bg-dark-950/95 backdrop-blur-lg border-t border-stone-200 dark:border-white/5 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-primary-600/10 text-primary-600 dark:text-primary-400"
                  : "text-stone-600 hover:text-stone-900 dark:text-gray-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:01122339739"
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-xl text-sm font-medium mt-4"
          >
            <Phone className="w-4 h-4" />
            <span>01122339739 - اطلب الآن</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
