"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative max-w-xl mx-auto">
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <Search className="w-5 h-5 text-stone-400 dark:text-gray-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ابحث في المنيو..."
        className="w-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl py-4 pr-12 pl-4 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500/50 dark:focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all shadow-sm dark:shadow-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400 hover:text-stone-950 dark:text-gray-500 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
