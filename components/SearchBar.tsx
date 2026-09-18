'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'ابحث عن وجبتك المفضلة (كبدة، كفتة، طواجن...)...',
}: SearchBarProps) {
  return (
    <div className="relative max-w-2xl mx-auto" dir="rtl">
      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-stone-400 dark:text-stone-500">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl py-2.5 sm:py-3 pr-10 pl-11 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all shadow-xs min-h-[44px]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 pr-2 text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px]"
          aria-label="مسح البحث"
          title="مسح البحث"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
