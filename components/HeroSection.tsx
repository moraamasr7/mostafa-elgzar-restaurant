"use client";

import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Flame, Star, ChevronDown, BookOpen, Calendar } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { usePaperMenu } from "@/features/menu/context/PaperMenuContext";
import { useReservation } from "@/features/reservations/context/ReservationContext";

export default function HeroSection() {
  const { openPaperMenu } = usePaperMenu();
  const { openReservationModal } = useReservation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-stone-50 dark:bg-dark-950 transition-colors duration-300">
        {/* Real Hero Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.9] dark:opacity-[0.80] transition-opacity duration-300"
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
          {/* Brand & Live Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2.5"
          >
            <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 dark:bg-primary-600/20 dark:border-primary-500/30 rounded-full px-4 py-1.5 shadow-xs">
              <Flame className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-bold">
                مطعم مصطفى الجزار
              </span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight"
          >
            <span className="text-stone-900 dark:text-white">أصل الأكل</span>{" "}
            <span className="text-gradient">الحرش</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-stone-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            أشهى الكبدة، الكفتة، السجق البلدي، والممبار من قلب المطرية لباب بيتك. طازة ومتحضرة يومياً بعناية.
          </motion.p>

          {/* Stats Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-stone-200 dark:border-white/10 shadow-xs backdrop-blur-sm text-xs sm:text-sm font-medium text-stone-700 dark:text-gray-300">
              <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
              <span>لحوم بلدي 100%</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-stone-200 dark:border-white/10 shadow-xs backdrop-blur-sm text-xs sm:text-sm font-medium text-stone-700 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>المطرية - القاهرة</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-stone-200 dark:border-white/10 shadow-xs backdrop-blur-sm text-xs sm:text-sm font-medium text-stone-700 dark:text-gray-300">
              <Clock className="w-4 h-4 text-gold-500" />
              <span>{siteConfig.workingHours}</span>
            </div>
          </motion.div>

          {/* Primary CTA Buttons with Clear Separation of Flows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 max-w-md mx-auto sm:max-w-none flex-wrap"
          >
            {/* 1. Order Flow -> /menu Interactive Menu */}
            <Link
              href="/menu"
              className="btn-primary text-base sm:text-lg px-8 py-3.5 sm:py-4 flex items-center justify-center gap-2.5 shadow-xl shadow-primary-600/25 w-full sm:w-auto font-black active:scale-98 min-h-[48px]"
            >
              <span>تصفح المنيو واطلب الآن</span>
              <ChevronDown className="w-5 h-5 -rotate-90 sm:rotate-0 animate-pulse" />
            </Link>

            {/* 2. Paper Menu Flow -> Direct Lightbox Modal */}
            <button
              type="button"
              onClick={openPaperMenu}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer bg-primary-600 text-white shadow-md shadow-primary-500/15 hover:bg-primary-500 active:scale-95 min-h-[44px]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>المنيو الورقي المصور</span>
            </button>

            {/* 3. Reservation Flow -> Direct Independent Reservation Modal */}
            <button
              type="button"
              onClick={() => openReservationModal('create')}
              className="btn-gold text-base sm:text-lg px-8 py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-xl shadow-gold-600/20 w-full sm:w-auto font-bold active:scale-98 min-h-[48px] cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>احجز طاولتك</span>
            </button>
          </motion.div>

          {/* Quick Hotline Phone */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="pt-2 flex items-center justify-center gap-2 text-stone-600 dark:text-gray-400 text-xs sm:text-sm"
          >
            <span>أو اطلب عبر التليفون مباشرة:</span>
            <a
              href={siteConfig.telUrl}
              className="inline-flex items-center gap-1 font-bold text-stone-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors underline underline-offset-4"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-primary-500" />
              <span>{siteConfig.phone}</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
