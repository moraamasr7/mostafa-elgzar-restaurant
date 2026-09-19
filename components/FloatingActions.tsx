"use client";

import { MapPin, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { useCart } from "@/features/cart/context/CartContext";

export default function FloatingActions() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { totalCount, isCartOpen, isCheckoutOpen } = useCart();

  useEffect(() => {
    // Show after scrolling 150px
    const handleScroll = () => {
      setIsVisible(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not render on administrative routes or active order tracking screen
  if (pathname.startsWith("/admin") || pathname.startsWith("/order")) {
    return null;
  }

  // Priority UI rule:
  // When Checkout or Cart is open, hide FloatingActions completely
  if (isCheckoutOpen || isCartOpen) {
    return null;
  }

  // When user has items in cart on mobile, CartBar takes the primary bottom action slot to prevent touch conflict
  if (totalCount > 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 50, x: "-50%" }}
          transition={{ duration: 0.3 }}
          className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/95 dark:bg-dark-950/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-white/10 shadow-xl w-[90%] max-w-sm justify-between md:hidden select-none"
          style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))" }}
          role="region"
          aria-label="إجراءات سريعة"
        >
          <Link
            href="/menu"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-500/20 flex-1 justify-center cursor-pointer min-h-[44px] active:scale-[0.98]"
            aria-label="اطلب الآن"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">اطلب الآن</span>
          </Link>
          <a
            href={siteConfig.locationMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 text-stone-800 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-stone-200 dark:border-white/10 flex-1 justify-center min-h-[44px] active:scale-[0.98]"
            aria-label="عرض موقع المطعم على خرائط جوجل"
          >
            <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
            <span className="whitespace-nowrap">موقعنا</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

