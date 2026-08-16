"use client";

import { motion } from "framer-motion";
import { Flame, ShoppingBag } from "lucide-react";
import { MenuItem } from "@/types/menu";
import { useOrderModal } from "@/components/OrderModalContext";

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export default function MenuCard({ item, index }: MenuCardProps) {
  const { openOrderModal } = useOrderModal();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card p-5 hover-lift group flex flex-col justify-between h-full"
    >
      <div>
        {/* Image Area */}
        <div className="relative h-40 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary-900/10 to-stone-100 dark:to-dark-800 flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
            style={{
              backgroundImage: `url('${item.image || "/images/logo.png"}')`,
              backgroundSize: item.image ? "cover" : "contain",
              backgroundPosition: "center",
            }}
          />
          {item.popular && (
            <div className="absolute top-3 left-3 bg-gold-500 text-stone-950 text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              شائع
            </div>
          )}
          <div className="relative z-10 w-12 h-12 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-primary-600/80 transition-colors">
            <span className="text-stone-800 dark:text-white font-bold text-lg group-hover:text-white">
              {item.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
              {item.name}
            </h3>
            <span className="text-gold-600 dark:text-gold-400 font-bold text-base shrink-0">
              {item.price > 0 ? `${item.price} ج` : "حسب الاختيار"}
            </span>
          </div>
          <p className="text-stone-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
            {item.description}
          </p>

          {/* Ingredients Pills */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {item.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium bg-primary-600/5 dark:bg-primary-600/20 text-primary-600 dark:text-primary-300 border border-primary-500/10 dark:border-primary-500/30 px-2 py-0.5 rounded-md whitespace-nowrap"
                >
                  {ing}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => openOrderModal(item.id)}
          className="w-full flex items-center justify-center gap-2 bg-stone-100 dark:bg-white/5 hover:bg-primary-600/10 dark:hover:bg-primary-600/20 border border-stone-200 dark:border-white/10 hover:border-primary-500/30 text-stone-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap inline-flex cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>اطلب الآن</span>
        </button>
      </div>
    </motion.div>
  );
}
