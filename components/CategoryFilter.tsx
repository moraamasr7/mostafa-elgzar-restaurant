"use client";

import { motion } from "framer-motion";
import { Grid3X3, Sandwich, Soup, Beef, UtensilsCrossed, Pizza, ChefHat, Wheat, Salad } from "lucide-react";
import { categories } from "@/data/menu";

const iconMap: Record<string, React.ElementType> = {
  Grid3X3,
  Sandwich,
  Soup,
  Beef,
  UtensilsCrossed,
  Pizza,
  ChefHat,
  Wheat,
  Salad,
};

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center w-full max-w-full -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
      {categories.map((category) => {
        const Icon = iconMap[category.icon] || Grid3X3;
        const isActive = activeCategory === category.id;

        return (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 shrink-0 ${
              isActive
                ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                : "bg-white dark:bg-white/5 text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/10"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{category.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
