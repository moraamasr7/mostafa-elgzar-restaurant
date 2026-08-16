"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Bike, X, Phone, ArrowLeft, Store } from "lucide-react";
import { getOrderingActionUrl, siteConfig, PublicOrderType } from "@/lib/config";

interface OrderModalContextType {
  openOrderModal: (itemId?: string) => void;
  closeOrderModal: () => void;
  isOpen: boolean;
}

const OrderModalContext = createContext<OrderModalContextType>({
  openOrderModal: () => {},
  closeOrderModal: () => {},
  isOpen: false,
});

export const useOrderModal = () => useContext(OrderModalContext);

export function OrderModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

  const openOrderModal = (itemId?: string) => {
    setSelectedItemId(itemId);
    setIsOpen(true);
  };

  const closeOrderModal = () => {
    setIsOpen(false);
    setSelectedItemId(undefined);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeOrderModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelectFulfillment = (orderType: PublicOrderType) => {
    const targetUrl = getOrderingActionUrl({
      type: orderType,
      itemId: selectedItemId,
    });
    closeOrderModal();

    if (typeof window !== "undefined") {
      window.location.href = targetUrl;
    }
  };

  return (
    <OrderModalContext.Provider value={{ openOrderModal, closeOrderModal, isOpen }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none dir-rtl">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOrderModal}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-900 border border-stone-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-modal-title"
            >
              {/* Close Button */}
              <button
                onClick={closeOrderModal}
                className="absolute top-5 left-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white bg-stone-100 dark:bg-white/5 transition-colors"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-8 space-y-2">
                <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-primary-650 dark:text-primary-400">
                  <Store className="w-3.5 h-3.5" />
                  <span>{siteConfig.name}</span>
                </div>
                <h3 id="order-modal-title" className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                  كيف تريد استلام طلبك؟
                </h3>
                <p className="text-stone-500 dark:text-gray-400 text-sm">
                  اختر طريقة الطلب المباشرة للمتابعة
                </p>
              </div>

              {/* Fulfillment Options */}
              <div className="space-y-4 mb-6">
                {/* Takeaway / Pickup Choice */}
                <button
                  onClick={() => handleSelectFulfillment("takeaway")}
                  className="w-full group text-right p-5 rounded-2xl border-2 border-stone-200 dark:border-white/10 hover:border-primary-600 dark:hover:border-primary-500 bg-stone-50/50 dark:bg-white/5 hover:bg-primary-50/50 dark:hover:bg-primary-600/10 transition-all duration-300 flex items-center justify-between gap-4 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-600/10 dark:bg-primary-600/20 text-primary-650 dark:text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-primary-650 dark:group-hover:text-primary-400 transition-colors">
                          استلام من الفرع
                        </h4>
                        <span className="text-[10px] font-extrabold bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md">
                          تجهيز سريع 🛍️
                        </span>
                      </div>
                      <p className="text-stone-500 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                        استلم طلبك بنفسك طازج وسخن من فرع المطعم
                      </p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-stone-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:-translate-x-1 transition-all shrink-0" />
                </button>

                {/* Home Delivery Choice */}
                <button
                  onClick={() => handleSelectFulfillment("delivery")}
                  className="w-full group text-right p-5 rounded-2xl border-2 border-stone-200 dark:border-white/10 hover:border-gold-500 dark:hover:border-gold-400 bg-stone-50/50 dark:bg-white/5 hover:bg-gold-500/5 dark:hover:bg-gold-500/10 transition-all duration-300 flex items-center justify-between gap-4 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gold-500/15 dark:bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Bike className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                          توصيل إلى المنزل
                        </h4>
                        <span className="text-[10px] font-extrabold bg-gold-500/20 text-gold-700 dark:text-gold-300 px-2 py-0.5 rounded-md">
                          توصيل سريع 🛵
                        </span>
                      </div>
                      <p className="text-stone-500 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                        نوصل طلبك مباشرة لباب بيتك بأعلى جودة
                      </p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-stone-400 group-hover:text-gold-500 group-hover:-translate-x-1 transition-all shrink-0" />
                </button>
              </div>

              {/* Direct Telephone Fallback */}
              <div className="pt-4 border-t border-stone-200/60 dark:border-white/5 text-center">
                <a
                  href={siteConfig.telUrl}
                  className="inline-flex items-center gap-2 text-stone-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span>أو اتصل بنا مباشرة: <strong dir="ltr">{siteConfig.phone}</strong></span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </OrderModalContext.Provider>
  );
}
