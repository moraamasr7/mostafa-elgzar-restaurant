import { Suspense } from 'react';
import { Metadata } from 'next';
import { OrderTrackingView } from '@/features/tracking/components/OrderTrackingView';

export const metadata: Metadata = {
  title: 'متابعة حالة الطلب | مطعم مصطفى الجزار',
  description: 'تتبع حالة طلبك لحظة بلحظة مع التحديث المباشر من مطعم مصطفى الجزار',
};

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default function OrderPage({ params }: OrderPageProps) {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4">
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-stone-100">
            <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-stone-400 font-bold text-sm tracking-wide">جاري تجهيز بيانات الطلب...</p>
          </div>
        }
      >
        <OrderTrackingView orderId={params.id} />
      </Suspense>
    </main>
  );
}
