import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { notificationService } from '@/features/notifications/notification.service';
import { CreateFeedbackPayload } from '@/features/feedback/types/feedback.types';

const recentFeedbackMap = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body: CreateFeedbackPayload = await request.json();
    const { customer_name, customer_phone, feedback_type, message } = body;

    // 1. Validation: Name
    const cleanName = (customer_name || '').trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: 'يرجى إدخال الاسم كاملاً' },
        { status: 400 }
      );
    }

    // 2. Validation: Egyptian Phone
    const cleanPhone = (customer_phone || '').trim().replace(/\s+/g, '');
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتف مصري صحيح (11 رقماً)' },
        { status: 400 }
      );
    }

    // 3. Validation: Type
    if (feedback_type !== 'suggestion' && feedback_type !== 'complaint') {
      return NextResponse.json(
        { error: 'نوع الرسالة يجب أن يكون إما مقترح أو شكوى' },
        { status: 400 }
      );
    }

    // 4. Validation: Message
    const cleanMessage = (message || '').trim();
    if (!cleanMessage || cleanMessage.length < 10) {
      return NextResponse.json(
        { error: 'يرجى كتابة تفاصيل رسالتك أو مقترحك بوضوح (10 أحرف على الأقل)' },
        { status: 400 }
      );
    }
    if (cleanMessage.length > 1000) {
      return NextResponse.json(
        { error: 'نص الرسالة طويل جداً، يرجى الاختصار' },
        { status: 400 }
      );
    }

    // 5. Anti-Abuse Rate Limiting (60s window per phone)
    const now = Date.now();
    const lastSubmitTime = recentFeedbackMap.get(cleanPhone);
    if (lastSubmitTime && now - lastSubmitTime < 60000) {
      return NextResponse.json(
        { error: 'تم استقبال رسالتك بالفعل، يرجى الانتظار دقيقة قبل إرسال رسالة أخرى' },
        { status: 429 }
      );
    }
    recentFeedbackMap.set(cleanPhone, now);

    // Prune map
    if (recentFeedbackMap.size > 500) {
      recentFeedbackMap.forEach((time, k) => {
        if (now - time > 120000) recentFeedbackMap.delete(k);
      });
    }

    // 6. Insert into Supabase `feedback` via Secure RPC
    const { data: rpcData, error: dbErr } = await supabase.rpc('submit_feedback_secure', {
      p_customer_name: cleanName,
      p_customer_phone: cleanPhone,
      p_feedback_type: feedback_type,
      p_message: cleanMessage,
    });

    if (dbErr || !rpcData || rpcData.length === 0) {
      console.error('[Feedback API Error]', dbErr);
      return NextResponse.json(
        { error: dbErr?.message || 'تعذر إرسال الرسالة حالياً، يرجى المحاولة لاحقاً' },
        { status: 500 }
      );
    }

    const insertedData = rpcData[0];

    // 7. Decoupled Notification Dispatch to Telegram
    notificationService
      .dispatch({
        type: 'feedback.received',
        customerName: cleanName,
        customerPhone: cleanPhone,
        feedbackType: feedback_type,
        message: cleanMessage,
        createdAt: insertedData.created_at || new Date().toISOString(),
      })
      .catch((e) => console.warn('[Notification] Dispatch error:', e));

    return NextResponse.json({
      success: true,
      feedback_id: insertedData.feedback_id,
      message: 'شكراً لتواصلك معنا! تم استلام رسالتك باهتمام وسيتم مراجعتها من قبل إدارة المطعم مباشرة.',
    });
  } catch (err: any) {
    console.error('[Feedback API Fatal Error]', err);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء إرسال الرسالة' },
      { status: 500 }
    );
  }
}
