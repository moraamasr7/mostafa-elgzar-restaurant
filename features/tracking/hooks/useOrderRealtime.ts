'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { OrderStatus } from '@/types/orders';

export interface CustomerOrderData {
  id: string;
  order_number: number;
  status: OrderStatus;
  customer_name: string;
  total_amount: number;
  created_at: string;
  order_type?: string;
  delivery_address?: string | null;
}

export interface CustomerOrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  item_notes?: string | null;
  item_name: string;
  variant_name?: string | null;
}

interface UseOrderRealtimeResult {
  order: CustomerOrderData | null;
  items: CustomerOrderItem[];
  loading: boolean;
  error: string | null;
}

export function useOrderRealtime(orderId: string, token: string | null): UseOrderRealtimeResult {
  const [order, setOrder] = useState<CustomerOrderData | null>(null);
  const [items, setItems] = useState<CustomerOrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('معرف الطلب غير متوفر');
      return;
    }

    let isMounted = true;

    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);

        // 1. Try secure RPC: get_customer_order_tracking
        if (token) {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_customer_order_tracking',
            {
              p_order_id: orderId,
              p_tracking_token: token,
            }
          );

          if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
            if (!isMounted) return;
            const row = rpcData[0];
            setOrder({
              id: row.id,
              order_number: Number(row.order_number),
              status: row.status as OrderStatus,
              customer_name: row.customer_name,
              total_amount: Number(row.total_amount),
              created_at: row.created_at,
              order_type: row.order_type,
              delivery_address: row.delivery_address,
            });

            if (row.items && Array.isArray(row.items)) {
              setItems(
                row.items.map((it: any) => ({
                  id: it.id || String(Math.random()),
                  quantity: it.quantity,
                  unit_price: it.unit_price,
                  subtotal: it.subtotal || it.quantity * it.unit_price,
                  item_notes: it.item_notes || null,
                  item_name: it.item_name || it.name || 'صنف',
                  variant_name: it.variant_name || null,
                }))
              );
            }
            setLoading(false);
            return;
          }
        }

        // 2. Direct fallback query with token restriction
        let query = supabase
          .from('orders')
          .select('id, order_number, status, customer_name, total_amount, created_at, order_type, delivery_address')
          .eq('id', orderId);

        if (token) {
          query = query.eq('tracking_token', token);
        }

        const { data: orderData, error: orderError } = await query.maybeSingle();

        if (orderError || !orderData) {
          if (!isMounted) return;
          setError('عفواً، تعذر العثور على تفاصيل الطلب أو انتهت صلاحية الرابط.');
          setLoading(false);
          return;
        }

        if (!isMounted) return;
        setOrder({
          id: orderData.id,
          order_number: Number(orderData.order_number),
          status: orderData.status as OrderStatus,
          customer_name: orderData.customer_name,
          total_amount: Number(orderData.total_amount),
          created_at: orderData.created_at,
          order_type: orderData.order_type,
          delivery_address: orderData.delivery_address,
        });

        // Fetch items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            unit_price,
            subtotal,
            item_notes,
            item_variants (
              variant_name,
              menu_items (
                name
              )
            )
          `)
          .eq('order_id', orderId);

        if (itemsData && isMounted) {
          const mappedItems: CustomerOrderItem[] = (itemsData as any[]).map((row) => ({
            id: row.id,
            quantity: row.quantity,
            unit_price: Number(row.unit_price),
            subtotal: Number(row.subtotal),
            item_notes: row.item_notes,
            item_name: row.item_variants?.menu_items?.name || 'صنف',
            variant_name: row.item_variants?.variant_name || null,
          }));
          setItems(mappedItems);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'حدث خطأ أثناء تحميل بيانات الطلب');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();

    // 3. Supabase Realtime Subscription for Status Updates
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (!isMounted) return;
          if (payload.new && payload.new.status) {
            setOrder((prev) => (prev ? { ...prev, status: payload.new.status as OrderStatus } : null));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [orderId, token]);

  return { order, items, loading, error };
}
