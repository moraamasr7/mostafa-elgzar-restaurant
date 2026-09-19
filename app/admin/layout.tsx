import React from 'react';
import Link from 'next/link';
import ShiftBar from '@/features/shifts/components/ShiftBar';

export const metadata = {
  title: 'لوحة التحكم والعمليات | مطعم مصطفى الجزار',
  description: 'نظام إدارة الطلبات والمطبخ وتتبع المناديب لمطعم مصطفى الجزار',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                مصطفى الجزار
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                لوحة العمليات
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
              <Link
                href="/admin"
                className="px-3.5 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/60 transition-colors"
              >
                📊 نظرة عامة
              </Link>
              <Link
                href="/admin/orders"
                className="px-3.5 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/60 transition-colors"
              >
                📦 إدارة الطلبات
              </Link>
              <Link
                href="/admin/drivers"
                className="px-3.5 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/60 transition-colors"
              >
                🛵 المناديب والرحلات
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              target="_blank"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors flex items-center gap-1.5"
            >
              <span>🍽️ عرض المنيو</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex border-t border-stone-800/80 px-2 py-1 text-xs font-bold overflow-x-auto">
          <Link href="/admin" className="px-3 py-2 text-stone-300 whitespace-nowrap">
            📊 نظرة عامة
          </Link>
          <Link href="/admin/orders" className="px-3 py-2 text-stone-300 whitespace-nowrap">
            📦 الطلبات
          </Link>
          <Link href="/admin/drivers" className="px-3 py-2 text-stone-300 whitespace-nowrap">
            🛵 المناديب
          </Link>
        </div>
      </header>

      {/* Persistent Daily Shift Bar */}
      <ShiftBar />

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
