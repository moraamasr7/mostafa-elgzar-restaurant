'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOrderRealtime } from '../hooks/useOrderRealtime';
import { STATUS_UI_CONFIG, OrderStatus } from '@/types/orders';

const STEP_SEQUENCE: OrderStatus[] = ['pending', 'processing', 'ready', 'out_for_delivery', 'delivered'];

const STEP_LABELS: Record<string, string> = {
  pending: 'استلام الطلب',
  processing: 'التجهيز بالمطبخ',
  ready: 'جاهز',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التسليم',
};

export function OrderTrackingView({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { order, items, loading, error } = useOrderRealtime(orderId, token);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-stone-100">
        <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-stone-300 font-bold text-sm tracking-wide">جاري تحديث بيانات طلبك...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h2 className="text-xl font-black text-stone-100 mb-2">تعذر عرض الطلب</h2>
          <p className="text-stone-400 text-xs leading-relaxed mb-6">
            {error || 'الرابط غير صالح أو انتهت صلاحية رمز التتبع المخصص لهذا الطلب.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/menu"
              className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              الرجوع لقائمة الطعام
            </Link>
            <a
              href="tel:01026131499"
              className="w-full py-3 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
            >
              اتصل بخدمة العملاء: 01026131499
            </a>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = order.status;
  const statusConfig = STATUS_UI_CONFIG[currentStatus] || STATUS_UI_CONFIG.pending;
  const isFailedOrCancelled = currentStatus === 'cancelled' || currentStatus === 'failed';

  // Calculate current step index in standard progression
  let currentStepIdx = STEP_SEQUENCE.indexOf(currentStatus);
  if (currentStatus === 'assigned' || currentStatus === 'picked_up') {
    currentStepIdx = STEP_SEQUENCE.indexOf('out_for_delivery');
  } else if (currentStatus === 'completed') {
    currentStepIdx = STEP_SEQUENCE.indexOf('delivered');
  }

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
              تتبع مباشر لحالة الطلب
            </span>
            <h1 className="text-2xl font-black text-stone-100">
              طلب #{order.order_number}
            </h1>
          </div>
          <div className="text-left">
            <span className="text-[11px] text-stone-400 block font-medium">وقت الطلب</span>
            <span className="text-xs font-bold text-stone-300" dir="ltr">
              {new Date(order.created_at).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${statusConfig.bgColor} ${statusConfig.borderColor} mt-4`}>
          <span className="text-3xl animate-pulse">{statusConfig.icon}</span>
          <div>
            <div className={`font-black text-base ${statusConfig.color}`}>
              {statusConfig.label}
            </div>
            <p className="text-stone-400 text-[11px] mt-0.5">
              يتم تحديث هذه الصفحة آنياً عند تغيير حالة الطلب بالمطبخ أو التوصيل
            </p>
          </div>
        </div>

        {/* Step Progress Tracker (If not cancelled/failed) */}
        {!isFailedOrCancelled && (
          <div className="mt-8 pt-6 border-t border-stone-800/80">
            <div className="grid grid-cols-5 gap-2 relative">
              {STEP_SEQUENCE.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 mb-2 ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/30'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-800 text-stone-500 border border-stone-700'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold leading-tight ${
                        isCurrent ? 'text-amber-400' : isPassed ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-sm font-black text-stone-200 border-b border-stone-800 pb-3 flex items-center justify-between">
          <span>تفاصيل الأصناف</span>
          <span className="text-xs font-normal text-stone-400">({items.length} صنف)</span>
        </h3>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/60 text-xs"
            >
              <div>
                <div className="font-bold text-stone-200">
                  {item.item_name}
                  {item.variant_name && item.variant_name !== 'افتراضي' && (
                    <span className="text-amber-400/90 mr-1.5 text-[11px] font-medium">
                      ({item.variant_name})
                    </span>
                  )}
                </div>
                {item.item_notes && (
                  <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                    <span>ملاحظة:</span>
                    <span className="text-amber-300/80">{item.item_notes}</span>
                  </p>
                )}
              </div>
              <div className="text-left font-black text-stone-200 tabular-nums">
                <span className="text-stone-400 text-[11px] ml-1">×{item.quantity}</span>
                {item.subtotal} ج.م
              </div>
            </div>
          ))}
        </div>

        {/* Customer & Address Information */}
        <div className="border-t border-stone-800 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-stone-400">
            <span>صاحب الطلب:</span>
            <span className="font-bold text-stone-200">{order.customer_name}</span>
          </div>

          {order.delivery_address && (
            <div className="flex justify-between text-stone-400">
              <span>عنوان التوصيل:</span>
              <span className="font-bold text-stone-200 text-left max-w-[240px] truncate">
                {order.delivery_address}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-stone-800 text-sm">
            <span className="font-black text-stone-200">المبلغ الإجمالي:</span>
            <span className="text-xl font-black text-amber-400 tabular-nums">
              {order.total_amount} ج.م
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="text-center space-y-3 pt-2">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors"
        >
          <span>← العودة لقائمة الطعام الرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
