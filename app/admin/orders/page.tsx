'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { OrderStatus, OrderType, STATUS_UI_CONFIG } from '@/types/orders';
import { OrderStateMachine } from '@/features/orders/domain/order-state-machine';

interface AdminOrder {
  id: string;
  order_number: number;
  status: OrderStatus;
  order_type: OrderType;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string | null;
  payment_method: string;
  payment_receipt_url?: string | null;
  total_amount: number;
  notes?: string | null;
  created_at: string;
}

interface DriverOption {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  status: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [assignModalOrder, setAssignModalOrder] = useState<AdminOrder | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  async function loadData() {
    try {
      setLoading(true);

      // Fetch Orders
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: ordersData, error: ordersErr } = await query;
      if (!ordersErr && ordersData) {
        setOrders(ordersData as AdminOrder[]);
      }

      // Fetch Drivers
      const { data: driversData } = await supabase
        .from('drivers')
        .select('id, name, phone, is_active, status')
        .order('name');

      if (driversData) {
        setDrivers(driversData as DriverOption[]);
      }
    } catch (e) {
      console.error('Error fetching admin orders:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // Supabase Realtime subscription
    const channel = supabase
      .channel('admin-orders-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleTransition(orderId: string, nextStatus: OrderStatus) {
    try {
      setActionLoading(orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          target_status: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'تعذر تحديث حالة الطلب');
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    } catch (e: any) {
      alert(e.message || 'حدث خطأ في الاتصال');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnassignDriver(orderId: string) {
    const reason = prompt('يرجى كتابة سبب إلغاء إسناد السائق وإعادة الطلب للمطبخ:');
    if (!reason) return;

    try {
      setActionLoading(orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          action: 'unassign_driver',
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'تعذر إلغاء الإسناد');
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'ready' } : o))
      );
      alert('تم إلغاء إسناد السائق بنجاح وإعادة الطلب لحالة جاهز للتسليم.');
    } catch (e: any) {
      alert(e.message || 'حدث خطأ أثناء إلغاء الإسناد');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAssignDriverSubmit() {
    if (!assignModalOrder || !selectedDriverId) return;

    try {
      setActionLoading(assignModalOrder.id);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: assignModalOrder.id,
          action: 'assign_driver',
          driver_id: selectedDriverId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'تعذر إسناد السائق');
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === assignModalOrder.id ? { ...o, status: 'assigned' } : o))
      );
      setAssignModalOrder(null);
      setSelectedDriverId('');
    } catch (e: any) {
      alert(e.message || 'حدث خطأ في الإسناد');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkFailed(orderId: string) {
    const reason = prompt('أدخل سبب تعذر تسليم الطلب (مثال: العميل لم يرد على الهاتف):');
    if (!reason) return;

    try {
      setActionLoading(orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          action: 'mark_failed',
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'تعذر تسجيل تعثر التوصيل');
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'delivery_failed' } : o))
      );
    } catch (e: any) {
      alert(e.message || 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelOrder(orderId: string) {
    const reason = prompt('أدخل سبب إلغاء هذا الطلب:');
    if (!reason) return;

    try {
      setActionLoading(orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          action: 'cancel',
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'تعذر إلغاء الطلب');
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
      );
    } catch (e: any) {
      alert(e.message || 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  }

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // Status tab filter
    if (selectedStatusTab !== 'all') {
      if (selectedStatusTab === 'kitchen' && !['pending', 'processing'].includes(order.status)) {
        return false;
      }
      if (selectedStatusTab === 'ready' && order.status !== 'ready') {
        return false;
      }
      if (selectedStatusTab === 'delivery' && !['assigned', 'picked_up', 'out_for_delivery'].includes(order.status)) {
        return false;
      }
      if (selectedStatusTab === 'completed' && !['delivered', 'completed'].includes(order.status)) {
        return false;
      }
      if (selectedStatusTab === 'failed' && !['cancelled', 'delivery_failed'].includes(order.status)) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = String(order.order_number).includes(q);
      const matchName = order.customer_name?.toLowerCase().includes(q);
      const matchPhone = order.customer_phone?.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة طلبات المطعم</h1>
          <p className="text-stone-400 text-xs mt-1">تحديث حالات الطلبات، إسناد المناديب، ومتابعة التحضير والتوصيل</p>
        </div>
        <button
          onClick={() => loadData()}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
        >
          🔄 تحديث الطلبات
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs font-bold">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'kitchen', label: 'المطبخ والتحضير' },
            { id: 'ready', label: 'جاهز للتسليم' },
            { id: 'delivery', label: 'قيد التوصيل' },
            { id: 'completed', label: 'مكتمل' },
            { id: 'failed', label: 'ملغي / متعثر' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedStatusTab === tab.id
                  ? 'bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/10'
                  : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 placeholder-stone-600"
          />
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {loading ? (
        <div className="text-center py-20 text-stone-400 text-xs">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          جاري تحميل وتحديث قائمة الطلبات...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-stone-900/40 rounded-2xl border border-stone-800 text-stone-500 text-xs">
          لا توجد أي طلبات تطابق معايير الفلترة أو البحث الحالية.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_UI_CONFIG[order.status] || STATUS_UI_CONFIG.pending;
            const allowedTransitions = OrderStateMachine.getAllowedTransitions(
              order.status,
              order.order_type || 'delivery'
            );
            const isDelivery = order.order_type === 'delivery';

            return (
              <div
                key={order.id}
                className="bg-stone-900/80 border border-stone-800 hover:border-stone-700/80 rounded-2xl p-5 shadow-xl transition-all space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-amber-400 tabular-nums">
                      #{order.order_number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-800 text-stone-300">
                      {isDelivery ? '🚗 توصيل منزلي' : '🛍️ استلام من الفرع'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}
                    >
                      <span>{statusConfig.icon}</span>
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-stone-400 font-mono">
                    <span dir="ltr">
                      {new Date(order.created_at).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'numeric',
                      })}
                    </span>
                    <span className="font-black text-white text-base font-sans tabular-nums">
                      {order.total_amount} ج.م
                    </span>
                  </div>
                </div>

                {/* Customer & Delivery Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/60 space-y-1.5">
                    <div className="text-stone-500 font-bold text-[10px]">بيانات العميل:</div>
                    <div className="font-black text-stone-200 text-sm">{order.customer_name}</div>
                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="text-amber-400 hover:text-amber-300 font-bold font-mono"
                        dir="ltr"
                      >
                        📞 {order.customer_phone}
                      </a>
                      <a
                        href={`https://wa.me/2${order.customer_phone.replace(/^0+/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        💬 واتساب
                      </a>
                    </div>
                  </div>

                  <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/60 space-y-1.5">
                    <div className="text-stone-500 font-bold text-[10px]">طريقة الدفع والتوصيل:</div>
                    <div className="font-bold text-stone-200">
                      الدفع:{' '}
                      <span className="text-amber-400">
                        {order.payment_method === 'instapay'
                          ? 'إنستاباي / فودافون كاش'
                          : order.payment_method === 'wallet'
                          ? 'محفظة إلكترونية'
                          : 'نقداً عند الاستلام'}
                      </span>
                    </div>
                    {order.payment_receipt_url && (
                      <div className="pt-1">
                        <a
                          href={order.payment_receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:underline"
                        >
                          📎 معاينة إيصال التحويل البنكي
                        </a>
                      </div>
                    )}
                    {isDelivery && (
                      <div className="text-stone-400 text-[11px] pt-1 leading-snug">
                        📍 {order.delivery_address || 'لم يحدد عنوان'}
                      </div>
                    )}
                  </div>

                  <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/60 space-y-1.5">
                    <div className="text-stone-500 font-bold text-[10px]">ملاحظات الطلب:</div>
                    <div className="text-stone-300 text-[11px] leading-relaxed italic">
                      {order.notes ? `"${order.notes}"` : 'لا توجد ملاحظات إضافية'}
                    </div>
                  </div>
                </div>

                {/* Domain-Guarded Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800/80">
                  {/* Transition buttons based on OrderStateMachine */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-stone-500 text-[11px] font-bold ml-1">الانتقال للحالة:</span>

                    {allowedTransitions.map((targetStatus) => {
                      const cfg = STATUS_UI_CONFIG[targetStatus];
                      if (!cfg) return null;

                      // Skip assigned from direct button (handled via assign modal)
                      if (targetStatus === 'assigned') return null;
                      if (targetStatus === 'cancelled') return null;
                      if (targetStatus === 'delivery_failed') return null;

                      return (
                        <button
                          key={targetStatus}
                          disabled={actionLoading === order.id}
                          onClick={() => handleTransition(order.id, targetStatus)}
                          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-black transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}

                    {/* Assign Driver Button (If Ready & Delivery) */}
                    {order.status === 'ready' && isDelivery && (
                      <button
                        onClick={() => {
                          setAssignModalOrder(order);
                          setSelectedDriverId(drivers.find((d) => d.is_active)?.id || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5"
                      >
                        <span>🛵 إسناد لمندوب</span>
                      </button>
                    )}

                    {/* Unassign Driver Button (If Assigned) */}
                    {order.status === 'assigned' && (
                      <button
                        disabled={actionLoading === order.id}
                        onClick={() => handleUnassignDriver(order.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-black transition-colors"
                      >
                        ↩️ سحب الطلب من السائق (إعادة للجاهز)
                      </button>
                    )}

                    {/* Delivery Failed Button (If Out for Delivery) */}
                    {['out_for_delivery', 'picked_up'].includes(order.status) && (
                      <button
                        disabled={actionLoading === order.id}
                        onClick={() => handleMarkFailed(order.id)}
                        className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 text-xs font-black transition-colors"
                      >
                        ⚠️ تعذر التوصيل
                      </button>
                    )}
                  </div>

                  {/* Cancel Order Action */}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <button
                      disabled={actionLoading === order.id}
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-[11px] font-bold text-red-400/80 hover:text-red-300 hover:underline transition-colors"
                    >
                      إلغاء الطلب ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Driver Modal */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-black text-white">إسناد مندوب للطلب #{assignModalOrder.order_number}</h3>
              <p className="text-stone-400 text-xs mt-1">اختر سائقاً من قائمة السائقين المفعلين في الوردية</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-300 block">المندوب:</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- اختر المندوب --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone}) {d.is_active ? '🟢 متاح' : '🔴 غير مفعل'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                disabled={!selectedDriverId || actionLoading === assignModalOrder.id}
                onClick={handleAssignDriverSubmit}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all disabled:opacity-50"
              >
                تأكيد الإسناد
              </button>
              <button
                onClick={() => setAssignModalOrder(null)}
                className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
