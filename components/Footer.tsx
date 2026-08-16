"use client";

import Link from "next/link";
import { Phone, MapPin, ExternalLink, Facebook } from "lucide-react";
import { siteConfig } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-stone-100 dark:bg-dark-950 border-t border-stone-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt={`${siteConfig.name} - Mostafa Elgzar`}
                className="w-12 h-12 object-contain rounded-xl shadow-lg"
              />
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                  {siteConfig.name}
                </h3>
                <p className="text-sm text-gold-600 dark:text-gold-400 font-semibold">{siteConfig.subtitle}</p>
              </div>
            </div>
            <p className="text-stone-600 dark:text-gray-400 text-sm leading-relaxed">
              {siteConfig.name} يقدم أشهى المأكولات الحرشة وفواكة اللحوم بأسعار مميزة. تصفح المنيو الخاص بنا الآن.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/mostafa.elgazar.res"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center text-stone-700 dark:text-white transition-colors shadow-sm dark:shadow-none"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@m.elgzar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:bg-primary-650 dark:hover:bg-primary-650 hover:text-white rounded-xl flex items-center justify-center text-stone-700 dark:text-white transition-colors shadow-sm dark:shadow-none"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.89c.3 0 .6.05.88.13v-3.5a6.36 6.36 0 0 0-.88-.06A6.34 6.34 0 0 0 3.25 15.8a6.34 6.34 0 0 0 6.33 6.34 6.34 6.34 0 0 0 6.33-6.34V9.91a8.16 8.16 0 0 0 4.78 1.54V7.91a4.83 4.83 0 0 1-1.1-.22z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-stone-900 dark:text-white">روابط سريعة</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-stone-600 dark:text-gray-400 hover:text-primary-650 dark:hover:text-primary-400 transition-colors text-sm">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-stone-600 dark:text-gray-400 hover:text-primary-650 dark:hover:text-primary-400 transition-colors text-sm">
                  المنيو الكامل
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-stone-600 dark:text-gray-400 hover:text-primary-650 dark:hover:text-primary-400 transition-colors text-sm">
                  عن المطعم
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-600 dark:text-gray-400 hover:text-primary-650 dark:hover:text-primary-400 transition-colors text-sm">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-stone-900 dark:text-white">معلومات التواصل</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
                <a
                  href={siteConfig.locationMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 dark:text-gray-400 text-sm hover:underline hover:text-primary-650 dark:hover:text-primary-400 transition-colors"
                >
                  {siteConfig.location}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <a href={siteConfig.telUrl} className="text-stone-600 dark:text-gray-400 hover:text-primary-650 dark:hover:text-primary-400 transition-colors text-sm font-semibold">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <a href={siteConfig.telUrlSecondary} className="text-stone-600 dark:text-gray-400 hover:text-primary-650 dark:hover:text-primary-400 transition-colors text-sm font-semibold">
                  {siteConfig.phoneSecondary}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone-500 dark:text-gray-500 text-sm">
            © 2026 مطعم مصطفى الجزار. جميع الحقوق محفوظة.
          </p>
          <p className="text-stone-400 dark:text-gray-600 text-xs">
            Developer By (AmrTec✔🇪🇬)
          </p>
        </div>
      </div>
    </footer>
  );
}
