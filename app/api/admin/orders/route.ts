import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { OrderStateMachine } from '@/features/orders/domain/order-state-machine';
import { OrderOperations } from '@/features/orders/domain/order-operations';
import { OrderStatus, OrderType } from '@/types/orders';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        order_type,
        customer_name,
        customer_phone,
        delivery_address,
        payment_method,
        payment_receipt_url,
        total_amount,
        notes,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'حدث خطأ في جلب الطلبات' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, action, target_status, driver_id, reason } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    // 1. Fetch current order state
    const { data: currentOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (fetchErr || !currentOrder) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const currentStatus = currentOrder.status as OrderStatus;
    const orderType = (currentOrder.order_type || 'delivery') as OrderType;

    // 2. Process Domain Action
    if (action === 'unassign_driver') {
      const opResult = OrderOperations.unassignDriver(currentOrder, reason || 'سحب الطلب من لوحة الإدارة');
      if (!opResult.success) {
        return NextResponse.json({ error: opResult.error }, { status: 422 });
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: opResult.changes?.status,
          notes: opResult.changes?.internal_notes,
        })
        .eq('id', order_id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'تم إلغاء إسناد السائق وإعادة الطلب للحالة الجاهزة' });
    }

    if (action === 'assign_driver') {
      if (!driver_id) {
        return NextResponse.json({ error: 'يجب اختيار سائق لإسناد الطلب' }, { status: 400 });
      }

      // Check driver
      const { data: driverData, error: driverErr } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driver_id)
        .single();

      if (driverErr || !driverData) {
        return NextResponse.json({ error: 'السائق غير موجود' }, { status: 404 });
      }

      const opResult = OrderOperations.assignDriver(
        currentOrder,
        driver_id,
        driverData.is_active ? 'active' : 'offline'
      );

      if (!opResult.success) {
        return NextResponse.json({ error: opResult.error }, { status: 422 });
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: 'assigned',
        })
        .eq('id', order_id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'تم إسناد الطلب للسائق بنجاح' });
    }

    if (action === 'mark_failed') {
      const opResult = OrderOperations.markDeliveryFailed(
        currentOrder,
        reason || 'تعذر التواصل مع العميل'
      );

      if (!opResult.success) {
        return NextResponse.json({ error: opResult.error }, { status: 422 });
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: 'failed',
          notes: opResult.changes?.internal_notes,
        })
        .eq('id', order_id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'تم تسجيل تعثر توصيل الطلب' });
    }

    if (action === 'cancel') {
      const opResult = OrderOperations.cancelOrder(
        currentOrder,
        reason || 'تم الإلغاء من لوحة الإدارة'
      );

      if (!opResult.success) {
        return NextResponse.json({ error: opResult.error }, { status: 422 });
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          notes: opResult.changes?.internal_notes,
        })
        .eq('id', order_id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'تم إلغاء الطلب' });
    }

    // Default: Regular state transition guarded by OrderStateMachine
    if (!target_status) {
      return NextResponse.json({ error: 'الحالة المستهدفة مطلوبة' }, { status: 400 });
    }

    const validation = OrderStateMachine.validateTransition(currentStatus, target_status as OrderStatus, orderType);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: target_status })
      .eq('id', order_id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, new_status: target_status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'حدث خطأ في تحديث الطلب' }, { status: 500 });
  }
}
