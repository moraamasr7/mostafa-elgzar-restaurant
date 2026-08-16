"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MenuItem } from "@/types/menu";
import { fetchFeaturedDishes } from "@/lib/menu";
import MenuCard from "@/components/MenuCard";

interface FeaturedDishesProps {
  items?: MenuItem[];
}

export default function FeaturedDishes({ items: initialItems }: FeaturedDishesProps) {
  const [dishes, setDishes] = useState<MenuItem[]>(initialItems || []);

  useEffect(() => {
    if (!initialItems || initialItems.length === 0) {
      let isMounted = true;
      const loadFeatured = async () => {
        const result = await fetchFeaturedDishes();
        if (isMounted) {
          setDishes(result.items);
        }
      };
      loadFeatured();
      return () => {
        isMounted = false;
      };
    }
  }, [initialItems]);

  const displayItems = (dishes.length > 0 ? dishes : []).slice(0, 3);

  return (
    <section className="py-24 bg-stone-100/50 dark:bg-dark-950/40 relative overflow-hidden transition-colors duration-300">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 rounded-full px-4 py-2 mb-6">
            <Flame className="w-4 h-4 text-gold-600 dark:text-gold-450" />
            <span className="text-gold-800 dark:text-gold-300 text-sm font-medium">الأكثر طلباً</span>
          </div>
          <h2 className="section-title text-stone-900 dark:text-white">أشهر أطباقنا</h2>
          <p className="section-subtitle text-stone-600 dark:text-gray-400">
            اكتشف أشهر الأطباق اللي بنقدمها واللي عملائنا بيحبوها دايماً
          </p>
        </motion.div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item, index) => (
            <MenuCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 hover:border-primary-500/30 text-stone-800 dark:text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 group shadow-sm dark:shadow-none"
          >
            <span>شوف المنيو الكامل</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
