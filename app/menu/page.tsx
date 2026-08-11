"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { menuItems } from "@/data/menu";
import MenuCard from "@/components/MenuCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24 pb-16 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 rounded-full px-4 py-2 mb-6">
            <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-primary-700 dark:text-primary-300 text-sm font-medium">المنيو الكامل</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            استكشف <span className="text-gradient">المنيــو</span>
          </h1>
          <p className="text-stone-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            أكثر من 30 صنف من الأكلات البلدي الأصيلة، اختار اللي نفسك فيه واطلبه الآن
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </motion.div>

        {/* Online Ordering Integration Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-primary-600/10 to-gold-500/10 border border-primary-500/20 dark:border-primary-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right"
        >
          <div className="space-y-1">
            <h4 className="text-stone-900 dark:text-white font-bold text-base sm:text-lg">
              تفضل الطلب للمنزل؟ 🚀
            </h4>
            <p className="text-stone-600 dark:text-gray-400 text-xs sm:text-sm">
              قريباً خدمة الطلب المباشر أونلاين! يمكنك الطلب حالياً عبر الاتصال الهاتفي
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 justify-center">
            <a
              href="tel:01122339739"
              className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-primary-500/20 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>01122339739</span>
            </a>
            <a
              href="tel:01020058231"
              className="bg-stone-200 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 text-stone-850 dark:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>01020058231</span>
            </a>
          </div>
        </motion.div>

        {/* Sticky Category Filter */}
        <div className="sticky top-20 z-40 bg-stone-50/95 dark:bg-dark-950/95 backdrop-blur-md py-4 border-b border-stone-200/50 dark:border-white/5 mb-12 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-colors duration-300">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-600 dark:text-gray-400 text-sm font-medium">
            {filteredItems.length} صنف متاح
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>
        </div>

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <MenuCard key={item.id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-stone-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-stone-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">مفيش نتائج</h3>
            <p className="text-stone-500 dark:text-gray-400">جرب تبحث بكلمات تانية أو غير الفلتر</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
