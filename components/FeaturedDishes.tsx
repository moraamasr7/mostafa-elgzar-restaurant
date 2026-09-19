"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { GroupedMenuItem } from "@/types/menu";
import { getLiveMenu } from "@/features/menu/queries/get-menu.query";
import MenuItemCard from "@/features/menu/components/MenuItemCard";
import { useCart } from "@/features/cart/context/CartContext";

export default function FeaturedDishes() {
  const [dishes, setDishes] = useState<GroupedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        const result = await getLiveMenu();
        if (isMounted) {
          if (result.categories && result.categories.length > 0) {
            // Flatten items across all categories and take top 3
            const allItems = result.categories.flatMap((cat) => cat.items);
            // Prioritize items that have images or are popular, else top 3
            const withImage = allItems.filter((i) => i.image_url || i.image);
            const selected = withImage.length >= 3 ? withImage.slice(0, 3) : allItems.slice(0, 3);
            setDishes(selected);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    };
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 sm:py-24 bg-stone-100/60 dark:bg-dark-900/40 relative overflow-hidden transition-colors duration-300">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 rounded-full px-4 py-1.5 mb-4">
            <Flame className="w-4 h-4 text-gold-600 dark:text-gold-400" />
            <span className="text-gold-800 dark:text-gold-300 text-xs sm:text-sm font-bold">الأكثر طلباً بالمطرية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tight">
            أشهر أطباقنا
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-gray-400 text-center max-w-xl mx-auto mt-2">
            الأطباق اللي عملائنا بيحبوها دايماً، طازة ومتحضرة على أصولها البلدي 🔥
          </p>
        </motion.div>

        {/* Featured Grid / Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="glass-card p-5 rounded-2xl animate-pulse h-64 flex flex-col justify-between"
              >
                <div className="w-full h-32 bg-stone-200 dark:bg-white/5 rounded-xl mb-3"></div>
                <div className="h-4 bg-stone-200 dark:bg-white/5 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-stone-200 dark:bg-white/5 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : dishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-2xl max-w-md mx-auto p-6">
            <p className="text-stone-500 dark:text-gray-400 text-sm">
              يمكنك استعراض جميع الأطباق مباشرة من صفحة المنيو.
            </p>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 hover:border-primary-500/30 text-stone-800 dark:text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 group shadow-sm active:scale-98 min-h-[48px]"
          >
            <span>استكشف المنيو الكامل والأسعار</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-primary-500" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
