'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MAX_ORDERS_PER_TRIP } from '@/features/trips/domain/trip-policy';

interface DriverItem {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  status: string;
  created_at: string;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadDrivers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDrivers(data as DriverItem[]);
      }
    } catch (e) {
      console.error('Error fetching drivers:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  async function toggleDriverActive(driverId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          is_active: !currentStatus,
          status: !currentStatus ? 'available' : 'offline',
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (error) {
        alert(error.message || 'تعذر تعديل حالة السائق');
        return;
      }

      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driverId
            ? { ...d, is_active: !currentStatus, status: !currentStatus ? 'available' : 'offline' }
            : d
        )
      );
    } catch (e: any) {
      alert(e.message || 'حدث خطأ في الاتصال');
    }
  }

  async function handleAddDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('drivers')
        .insert({
          name: newName.trim(),
          phone: newPhone.trim(),
          is_active: true,
          status: 'available',
        })
        .select()
        .single();

      if (error) {
        alert(error.message || 'تعذر إضافة السائق');
        return;
      }

      if (data) {
        setDrivers((prev) => [data as DriverItem, ...prev]);
        setShowAddModal(false);
        setNewName('');
        setNewPhone('');
      }
    } catch (e: any) {
      alert(e.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة المناديب وتوزيع الرحلات</h1>
          <p className="text-stone-400 text-xs mt-1">
            متابعة حالة المناديب، الوردية، وقواعد سعة الرحلات القصوى ({MAX_ORDERS_PER_TRIP} طلبات كحد أقصى لكل رحلة)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-md shadow-amber-500/10"
          >
            + إضافة مندوب جديد
          </button>
        </div>
      </div>

      {/* Policy Notice Box */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl">📋</span>
        <div className="text-xs leading-relaxed text-stone-300">
          <strong className="text-amber-400 font-bold block mb-0.5">قاعدة تشغيل الرحلات (Trip Policy):</strong>
          الحد الأقصى المسموح به لأي مندوب في الرحلة الواحدة هو <strong className="text-white">{MAX_ORDERS_PER_TRIP} طلبات</strong> فقط للحفاظ على جودة وسخونة وجبات المشويات. السائق غير المفعل بالوردية لا يمكن إسناد رحلات له.
        </div>
      </div>

      {/* Drivers List */}
      {loading ? (
        <div className="text-center py-20 text-stone-400 text-xs">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          جاري تحميل بيانات المناديب...
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-20 bg-stone-900/40 rounded-2xl border border-stone-800 text-stone-500 text-xs">
          لا يوجد مناديب مسجلين حالياً. اضغط على &quot;إضافة مندوب جديد&quot; للبدء.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-lg">
                    🛵
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">{driver.name}</h3>
                    <a
                      href={`tel:${driver.phone}`}
                      className="text-stone-400 hover:text-amber-400 text-xs font-mono"
                      dir="ltr"
                    >
                      {driver.phone}
                    </a>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                    driver.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {driver.is_active ? '🟢 في الوردية' : '⚪ غير مفعل'}
                </span>
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/60 text-xs flex justify-between items-center text-stone-400">
                <span>الحالة الحالية:</span>
                <span className="font-bold text-stone-200">
                  {driver.status === 'available' ? 'جاهز لاستلام رحلة' : driver.status === 'busy' ? 'في رحلة جارية' : 'غير متصل'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => toggleDriverActive(driver.id, driver.is_active)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-colors ${
                    driver.is_active
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {driver.is_active ? 'إنهاء الوردية (تعطيل)' : 'تفعيل بالوردية'}
                </button>
                <a
                  href={`tel:${driver.phone}`}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  title="اتصال بالسائق"
                >
                  📞
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-black text-white">إضافة مندوب جديد للمطعم</h3>
              <p className="text-stone-400 text-xs mt-1">سجل بيانات السائق لإسناد رحلات التوصيل إليه</p>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">اسم السائق:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">رقم الهاتف:</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all disabled:opacity-50"
                >
                  {submitting ? 'جاري الإضافة...' : 'حفظ وإضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
