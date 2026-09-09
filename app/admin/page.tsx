'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { OrderStatus, STATUS_UI_CONFIG } from '@/types/orders';

interface DashboardStats {
  totalOrdersToday: number;
  activeOrders: number;
  totalRevenueToday: number;
  activeDriversCount: number;
  pendingCount: number;
  processingCount: number;
  readyCount: number;
  deliveringCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrdersToday: 0,
    activeOrders: 0,
    totalRevenueToday: 0,
    activeDriversCount: 0,
    pendingCount: 0,
    processingCount: 0,
    readyCount: 0,
    deliveringCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Fetch today's start timestamp in ISO
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfDayIso = startOfDay.toISOString();

      // 1. Fetch orders from today
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfDayIso)
        .order('created_at', { ascending: false });

      // 2. Fetch drivers count
      const { data: driversData } = await supabase
        .from('drivers')
        .select('id, is_active, status')
        .eq('is_active', true);

      if (!ordersErr && ordersData) {
        let revenue = 0;
        let pending = 0;
        let processing = 0;
        let ready = 0;
        let delivering = 0;

        ordersData.forEach((order) => {
          if (order.status !== 'cancelled' && order.status !== 'delivery_failed') {
            revenue += Number(order.total_amount || 0);
          }
          if (order.status === 'pending') pending++;
          if (order.status === 'processing') processing++;
          if (order.status === 'ready') ready++;
          if (['assigned', 'picked_up', 'out_for_delivery'].includes(order.status)) delivering++;
        });

        const activeTotal = pending + processing + ready + delivering;

        setStats({
          totalOrdersToday: ordersData.length,
          activeOrders: activeTotal,
          totalRevenueToday: revenue,
          activeDriversCount: driversData?.length || 0,
          pendingCount: pending,
          processingCount: processing,
          readyCount: ready,
          deliveringCount: delivering,
        });

        setRecentOrders(ordersData.slice(0, 8));
      }
    } catch (e) {
      console.error('Error loading admin dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();

    // Subscribe to realtime changes in orders
    const channel = supabase
      .channel('admin-dashboard-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">نظرة عامة على العمليات</h1>
          <p className="text-stone-400 text-xs mt-1">متابعة فورية ومباشرة لنشاط المطعم والمطبخ وتوصيل الطلبات</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboardData()}
            className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-2"
          >
            <span>🔄 تحديث البيانات</span>
          </button>
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-md shadow-amber-500/10"
          >
            عرض كافة الطلبات ←
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-stone-400 text-xs font-bold mb-1">طلبات اليوم</div>
          <div className="text-3xl font-black text-white tabular-nums">
            {loading ? '...' : stats.totalOrdersToday}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">منذ بداية اليوم (12:00 ص)</div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-stone-400 text-xs font-bold mb-1">طلبات جارية (نشطة)</div>
          <div className="text-3xl font-black text-amber-400 tabular-nums">
            {loading ? '...' : stats.activeOrders}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-2">بالمطبخ، قيد التجهيز، والتوصيل</div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-stone-400 text-xs font-bold mb-1">إجمالي المبيعات اليوم</div>
          <div className="text-3xl font-black text-emerald-400 tabular-nums">
            {loading ? '...' : `${stats.totalRevenueToday.toLocaleString()} ج.م`}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-2">الطلبات المؤكدة وغير الملغية</div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-stone-400 text-xs font-bold mb-1">المناديب النشطين</div>
          <div className="text-3xl font-black text-sky-400 tabular-nums">
            {loading ? '...' : stats.activeDriversCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">جاهزون لاستلام وتوصيل الرحلات</div>
        </div>
      </div>

      {/* Operational Pipeline Status */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6">
        <h2 className="text-sm font-black text-stone-200 mb-4">مسار تدفق الطلبات المباشر (Pipeline)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-stone-950/80 border border-amber-500/20 rounded-xl p-4">
            <span className="text-2xl block mb-1">🔔</span>
            <div className="text-xs text-stone-400 font-bold">بانتظار التأكيد</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{stats.pendingCount}</div>
          </div>
          <div className="bg-stone-950/80 border border-orange-500/20 rounded-xl p-4">
            <span className="text-2xl block mb-1">👨‍🍳</span>
            <div className="text-xs text-stone-400 font-bold">قيد التجهيز بالمطبخ</div>
            <div className="text-2xl font-black text-orange-400 mt-1">{stats.processingCount}</div>
          </div>
          <div className="bg-stone-950/80 border border-emerald-500/20 rounded-xl p-4">
            <span className="text-2xl block mb-1">✅</span>
            <div className="text-xs text-stone-400 font-bold">جاهزة للتسليم / الكابتن</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.readyCount}</div>
          </div>
          <div className="bg-stone-950/80 border border-blue-500/20 rounded-xl p-4">
            <span className="text-2xl block mb-1">🛵</span>
            <div className="text-xs text-stone-400 font-bold">مع المندوب في الطريق</div>
            <div className="text-2xl font-black text-sky-400 mt-1">{stats.deliveringCount}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <h2 className="text-base font-black text-white">آخر الطلبات المستلمة</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-amber-400 hover:text-amber-300">
            عرض القائمة الكاملة ({stats.totalOrdersToday})
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-xs">
            لا توجد طلبات مسجلة حتى الآن اليوم.
          </div>
        ) : (
          <div className="divide-y divide-stone-800/80 overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-stone-400 border-b border-stone-800">
                  <th className="pb-3 font-bold">رقم الطلب</th>
                  <th className="pb-3 font-bold">العميل</th>
                  <th className="pb-3 font-bold">النوع</th>
                  <th className="pb-3 font-bold">الحالة</th>
                  <th className="pb-3 font-bold">المبلغ</th>
                  <th className="pb-3 font-bold">الوقت</th>
                  <th className="pb-3 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {recentOrders.map((order) => {
                  const statusConfig = STATUS_UI_CONFIG[order.status as OrderStatus] || STATUS_UI_CONFIG.pending;
                  return (
                    <tr key={order.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 font-black text-amber-400 tabular-nums">
                        #{order.order_number}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-white">{order.customer_name}</div>
                        <div className="text-[11px] text-stone-400 font-mono" dir="ltr">{order.customer_phone}</div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300">
                          {order.order_type === 'delivery' ? 'توصيل' : 'استلام من الفرع'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}>
                          <span>{statusConfig.icon}</span>
                          <span>{statusConfig.label}</span>
                        </span>
                      </td>
                      <td className="py-3 font-black text-stone-200 tabular-nums">
                        {order.total_amount} ج.م
                      </td>
                      <td className="py-3 text-stone-400 text-[11px]" dir="ltr">
                        {new Date(order.created_at).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 text-center">
                        <Link
                          href={`/admin/orders?highlight=${order.id}`}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold transition-colors"
                        >
                          إدارة الطلب
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
