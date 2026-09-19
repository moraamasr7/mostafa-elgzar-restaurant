import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { CreateOrderPayload, OrderItemInput } from '@/types/orders';
import { notificationService } from '@/features/notifications/notification.service';

export const dynamic = 'force-dynamic';

const recentOrdersMap = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderPayload = await request.json();
    const {
      customer_name,
      customer_phone,
      notes,
      order_type,
      delivery_address,
      payment_method,
      payment_receipt_url,
      customer_lat,
      customer_lng,
      items,
      turnstile_token,
    } = body;

    // Cloudflare Turnstile anti-bot verification
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
    if (turnstileSecret) {
      if (!turnstile_token || turnstile_token === 'demo-token') {
        return NextResponse.json(
          { error: 'يلزم التحقق الأمني ضد الروبوتات (يرجى تحديد مربع التحقق). يرجى المحاولة ثانية.' },
          { status: 400 }
        );
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const turnstileRes = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              secret: turnstileSecret,
              response: turnstile_token,
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        const turnstileData = await turnstileRes.json();
        if (!turnstileData.success) {
          return NextResponse.json(
            { error: 'فشل التحقق الأمني (Turnstile). يرجى تحديث الصفحة والمحاولة ثانية.' },
            { status: 400 }
          );
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('Turnstile verification timed out after 4s, proceeding gracefully to avoid blocking customer.');
        } else {
          console.warn('Turnstile verification network error:', err);
        }
      }
    }

    // Name Validation
    const cleanName = customer_name?.trim() || '';
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم صحيح (بين 2 و100 حرف)' },
        { status: 400 }
      );
    }

    // Egyptian Phone Validation
    const cleanPhone = customer_phone?.replace(/\s/g, '') || '';
    if (!/^01\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'رقم الموبايل غير صحيح (يجب أن يكون 11 رقماً ويبدأ بـ 01)' },
        { status: 400 }
      );
    }

    // Order Type Validation
    const cleanOrderType = order_type ? order_type.trim().toLowerCase() : 'takeaway';
    if (!['takeaway', 'delivery', 'dine_in'].includes(cleanOrderType)) {
      return NextResponse.json(
        { error: 'نوع استلام الطلب غير صالح' },
        { status: 400 }
      );
    }

    // Delivery Address Validation
    const cleanDeliveryAddress = delivery_address?.trim() || '';
    if (cleanOrderType === 'delivery' && (!cleanDeliveryAddress || cleanDeliveryAddress.length < 5)) {
      return NextResponse.json(
        { error: 'عنوان التوصيل مطلوب وبحد أدنى 5 أحرف عند اختيار الدليفري' },
        { status: 400 }
      );
    }

    // Payment Method & Takeaway Advance Payment Validation
    const cleanPaymentMethod = payment_method || (cleanOrderType === 'takeaway' ? 'instapay' : 'cash');
    const cleanPaymentReceipt = payment_receipt_url?.trim() || '';

    if (cleanOrderType === 'takeaway' && cleanPaymentReceipt.length < 3) {
      return NextResponse.json(
        { error: 'يلزم كتابة رقم العملية أو إرفاق إثبات تحويل المبلغ كاملاً لتأكيد تحضير طلب الاستلام من الفرع' },
        { status: 400 }
      );
    }

    const cleanNotes = notes?.trim().slice(0, 500) || undefined;

    // Items Validation
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 20) {
      return NextResponse.json(
        { error: 'السلة يجب أن تحتوي على صنف واحد على الأقل (وبحد أقصى 20 صنفاً)' },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.variant_id || typeof item.variant_id !== 'string') {
        return NextResponse.json(
          { error: 'مُعرّف الصنف غير صالح' },
          { status: 400 }
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 50) {
        return NextResponse.json(
          { error: 'الكمية لكل صنف يجب أن تكون رقماً صحيحاً بين 1 و 50' },
          { status: 400 }
        );
      }
    }

    // Anti-Spam Rate Limiting (10s window on same phone + items)
    const requestKey = `${cleanPhone}:${cleanOrderType}:${items.map((i) => `${i.variant_id}:${i.quantity}`).sort().join(',')}`;
    const now = Date.now();
    const lastSubmitTime = recentOrdersMap.get(requestKey);

    if (lastSubmitTime && now - lastSubmitTime < 10000) {
      return NextResponse.json(
        { error: 'تم استقبال طلبك بالفعل، يرجى الانتظار بضع ثوانٍ قبل تكرار الإرسال.' },
        { status: 429 }
      );
    }
    recentOrdersMap.set(requestKey, now);

    // Prune old map entries
    if (recentOrdersMap.size > 500) {
      recentOrdersMap.forEach((time, k) => {
        if (now - time > 60000) recentOrdersMap.delete(k);
      });
    }

    const sanitizedItemsJson = items.map((item: OrderItemInput) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
      item_notes: item.item_notes?.trim().slice(0, 200) || null,
    }));

    // Authoritative RPC: create_order_secure
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_order_secure', {
      p_customer_name: cleanName,
      p_customer_phone: cleanPhone,
      p_notes: cleanNotes || null,
      p_items: sanitizedItemsJson,
      p_order_type: cleanOrderType,
      p_delivery_address: cleanOrderType === 'delivery' ? cleanDeliveryAddress : null,
      p_payment_method: cleanPaymentMethod,
      p_payment_receipt_url: cleanPaymentReceipt || null,
      p_customer_lat: typeof customer_lat === 'number' && !isNaN(customer_lat) ? customer_lat : null,
      p_customer_lng: typeof customer_lng === 'number' && !isNaN(customer_lng) ? customer_lng : null,
    });

    if (rpcError || !rpcData || rpcData.length === 0) {
      console.error('[RPC create_order_secure Error]:', rpcError?.message);
      const friendlyMessage =
        rpcError?.message ||
        'تعذر تسجيل الطلب حالياً. يرجى التأكد من أن المطعم مفتوح حالياً وأن جميع الأصناف متوفرة.';
      return NextResponse.json({ error: friendlyMessage }, { status: 400 });
    }

    const createdOrder = rpcData[0];

    // Trigger Non-Blocking Isolated Notification Event in background
    notificationService.dispatch({
      type: 'order.created',
      orderId: createdOrder.order_id,
      orderNumber: Number(createdOrder.order_number),
      customerName: cleanName,
      customerPhone: cleanPhone,
      orderType: cleanOrderType,
      deliveryAddress: cleanDeliveryAddress || null,
      paymentMethod: cleanPaymentMethod,
      paymentReceiptUrl: cleanPaymentReceipt || null,
      totalAmount: Number(createdOrder.total_amount),
      notes: cleanNotes || null,
      trackingToken: createdOrder.tracking_token,
      itemsCount: items.length,
      createdAt: new Date().toISOString(),
    });

    // Return immediate success to customer
    return NextResponse.json(
      {
        order_id: createdOrder.order_id,
        order_number: createdOrder.order_number,
        total_amount: createdOrder.total_amount,
        tracking_token: createdOrder.tracking_token,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API /api/orders Exception]:', err);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع في النظام. يرجى المحاولة لاحقاً أو الاتصال بالمطعم مباشرة.' },
      { status: 500 }
    );
  }
}
