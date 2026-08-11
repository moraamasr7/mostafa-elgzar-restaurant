"use client";

import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Flame, Star, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-stone-50 dark:bg-dark-950 transition-colors duration-300">
        {/* Real Hero Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.4] dark:opacity-[0.75] transition-opacity duration-300"
          style={{ backgroundImage: "url('/images/hero.png')" }}
        />
        <div className="absolute inset-0 bg-white/70 dark:bg-black/50 transition-colors duration-300" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-50/20 to-stone-50 dark:via-dark-950/20 dark:to-dark-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.04),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.06),transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ea580c' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 dark:bg-primary-600/20 dark:border-primary-500/30 rounded-full px-4 py-2 animate-pulse"
          >
            <Flame className="w-4 h-4 text-primary-605 dark:text-primary-400" />
            <span className="text-primary-700 dark:text-primary-300 text-sm font-medium">مصطفى الجزار - Mostafa Elgzar</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
          >
            <span className="text-stone-900 dark:text-white">أصل الأكل</span>{" "}
            <span className="text-gradient">الحرش</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-stone-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-semibold"
          >
            تصفح قائمة طعامنا المميزة واكتشف أجمد الأكلات المطبوخة يومياً بعناية.
          </motion.p>

          {/* Stats Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-stone-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <Star className="w-5 h-5 text-gold-550 fill-gold-550 dark:text-gold-400 dark:fill-gold-400" />
              <span className="text-stone-700 dark:text-gray-300 text-sm font-medium">أفضل الأكلات الحرشة</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-stone-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-stone-700 dark:text-gray-300 text-sm font-medium">المطرية - القاهرة</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-stone-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <Clock className="w-5 h-5 text-gold-550 dark:text-gold-400" />
              <span className="text-stone-700 dark:text-gray-300 text-sm font-medium">من 4 عصراً إلى 4 فجراً</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/menu"
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-lg shadow-primary-500/20 w-full sm:w-auto justify-center whitespace-nowrap inline-flex"
            >
              <span>المنيــو</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </Link>
            <a
              href="https://maps.app.goo.gl/D5ENYuQWe8EdeyjS6"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-lg px-8 py-4 flex items-center gap-2 shadow-lg shadow-gold-500/20 w-full sm:w-auto justify-center whitespace-nowrap inline-flex"
            >
              <MapPin className="w-5 h-5 text-white" />
              <span>موقعنا</span>
            </a>
          </motion.div>

          {/* Phone Numbers Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          >
            <a
              href="tel:01122339739"
              className="inline-flex items-center gap-2 text-xl md:text-2xl font-bold text-stone-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              dir="ltr"
            >
              <Phone className="w-5 h-5 text-primary-500" />
              <span>011 223 39 739</span>
            </a>
            <a
              href="tel:01020058231"
              className="inline-flex items-center gap-2 text-xl md:text-2xl font-bold text-stone-100 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              dir="ltr"
            >
              <Phone className="w-5 h-5 text-primary-500" />
              <span>010 200 58 231</span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-stone-300 dark:border-white/20 rounded-full flex flex-col items-center justify-center p-2"
        >
          <ChevronDown className="w-4 h-4 text-primary-650 dark:text-primary-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
