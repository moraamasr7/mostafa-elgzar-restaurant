"use client";

import { Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function FloatingActions() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after scrolling 200px or immediately on pages
    const handleScroll = () => {
      setIsVisible(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    // Trigger immediately
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 50, x: "-50%" }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/90 dark:bg-dark-950/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 shadow-xl w-[90%] max-w-sm justify-between md:hidden"
        >
          <a
            href="tel:01122339739"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-500/20 flex-1 justify-center"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">اتصل بنا</span>
          </a>
          <a
            href="https://maps.app.goo.gl/D5ENYuQWe8EdeyjS6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 text-stone-800 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-stone-200 dark:border-white/10 flex-1 justify-center"
          >
            <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
            <span className="whitespace-nowrap">موقعنا</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
