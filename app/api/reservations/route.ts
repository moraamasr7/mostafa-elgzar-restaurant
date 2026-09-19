import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getReservationAvailability } from '@/features/reservations/domain/reservation-availability';
import { notificationService } from '@/features/notifications/notification.service';
import { CreateReservationPayload } from '@/features/reservations/types/reservation.types';

// Rate Limiting Map (Phone -> timestamp)
const recentReservationsMap = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json({ error: 'تاريخ الحجز مطلوب' }, { status: 400 });
    }

    const availability = await getReservationAvailability(dateStr);
    return NextResponse.json(availability);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'تعذر جلب المواعيد المتاحة حالياً، يرجى المحاولة لاحقاً' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateReservationPayload = await request.json();
    const {
      customer_name,
      customer_phone,
      reservation_date,
      reservation_time,
      guest_count,
      notes,
      deposit_amount,
      deposit_receipt_url,
      deposit_payment_method,
      deposit_sender_phone,
    } = body;

    // 1. Validation: Name
    const cleanName = (customer_name || '').trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم صحيح لا يقل عن حرفين' },
        { status: 400 }
      );
    }

    // 2. Validation: Egyptian Phone
    const cleanPhone = (customer_phone || '').trim().replace(/\s+/g, '');
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقماً' },
        { status: 400 }
      );
    }

    // 3. Validation: Guest Count & Deposit Calculation
    const guests = parseInt(String(guest_count), 10);
    if (isNaN(guests) || guests < 1 || guests > 30) {
      return NextResponse.json(
        { error: 'عدد الأفراد يجب أن يكون بين شخص واحد و 30 شخصاً' },
        { status: 400 }
      );
    }

    // Arabon deposit rule: 1-3 guests = 100 EGP, 4-6 = 200 EGP, 7-9 = 300 EGP, etc.
    const expectedDeposit = Math.ceil(guests / 3) * 100;

    // 3.1 Validation: Deposit receipt proof & sender phone
    const cleanReceiptUrl = (deposit_receipt_url || '').trim();
    if (!cleanReceiptUrl || cleanReceiptUrl.length < 5) {
      return NextResponse.json(
        { error: 'يلزم رفع صورة إشعار أو إيصال تحويل مبلغ العربون لتأكيد حجز الطاولة' },
        { status: 400 }
      );
    }

    const cleanSenderPhone = (deposit_sender_phone || cleanPhone).trim().replace(/\s+/g, '');
    if (!egPhoneRegex.test(cleanSenderPhone)) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتف صحيح تم التحويل منه (11 رقماً يبدأ بـ 01)' },
        { status: 400 }
      );
    }

    const validPaymentMethod = deposit_payment_method === 'wallet' ? 'wallet' : 'instapay';

    // 4. Rate Limiting (60s window per phone)
    const now = Date.now();
    const lastSubmitTime = recentReservationsMap.get(cleanPhone);
    if (lastSubmitTime && now - lastSubmitTime < 60000) {
      return NextResponse.json(
        { error: 'تم استقبال طلب حجز مسبق من هذا الرقم، يرجى الانتظار دقيقة قبل المحاولة مجدداً' },
        { status: 429 }
      );
    }
    recentReservationsMap.set(cleanPhone, now);

    // Prune map if large
    if (recentReservationsMap.size > 500) {
      recentReservationsMap.forEach((time, k) => {
        if (now - time > 120000) recentReservationsMap.delete(k);
      });
    }

    // 5. Authoritative Server-Side Availability Check
    const availability = await getReservationAvailability(reservation_date);
    if (!availability.isOpen) {
      return NextResponse.json(
        { error: availability.reason || 'المطعم غير متاح للحجز في هذا اليوم' },
        { status: 422 }
      );
    }

    const requestedSlot = availability.slots.find(
      (s) => s.time === reservation_time || s.time === `${reservation_time}:00`
    );

    if (!requestedSlot) {
      return NextResponse.json(
        { error: 'الوقت المحدد غير مدرج ضمن مواعيد العمل المعتمدة' },
        { status: 422 }
      );
    }

    if (!requestedSlot.available) {
      return NextResponse.json(
        { error: requestedSlot.reason || 'الموعد المختار غير متاح حالياً، يرجى اختيار موعد آخر' },
        { status: 422 }
      );
    }

    // 6. Format Notes with Deposit Metadata
    const depositNoteMeta = `[عربون: ${expectedDeposit} ج.م | وسيلة الدفع: ${validPaymentMethod === 'instapay' ? 'إنستاباي' : 'محفظة كاش'} | رقم المحول: ${cleanSenderPhone}]`;
    const combinedNotes = notes?.trim()
      ? `${notes.trim().slice(0, 200)} | ${depositNoteMeta}`
      : depositNoteMeta;

    // 7. Authoritative Reservation Creation via RPC
    const { data: rpcData, error: dbErr } = await supabase.rpc('create_reservation_secure', {
      p_customer_name: cleanName,
      p_customer_phone: cleanPhone,
      p_reservation_date: reservation_date,
      p_reservation_time: `${requestedSlot.time}:00`,
      p_guest_count: guests,
      p_notes: combinedNotes,
      p_deposit_amount: expectedDeposit,
      p_deposit_receipt_url: cleanReceiptUrl,
    });

    if (dbErr || !rpcData || rpcData.length === 0) {
      console.error('[Reservations API Error]', dbErr);
      const isBusinessError = dbErr?.message && (
        dbErr.message.includes('اكتملت طاقته') || 
        dbErr.message.includes('مغلق') || 
        dbErr.message.includes('عطلة') ||
        dbErr.message.includes('تاريخ')
      );
      return NextResponse.json(
        { error: dbErr?.message || 'تعذر تسجيل الحجز حالياً، يرجى المحاولة بعد قليل أو الاتصال مباشرة بالفرع' },
        { status: isBusinessError ? 422 : 500 }
      );
    }

    const insertedData = rpcData[0];
    const resNumber = Number(insertedData.reservation_number || 0);

    // 8. Decoupled Non-blocking Notification Dispatch
    notificationService
      .dispatch({
        type: 'reservation.created',
        reservationNumber: resNumber,
        customerName: cleanName,
        customerPhone: cleanPhone,
        reservationDate: reservation_date,
        reservationTime: requestedSlot.displayTime,
        guestCount: guests,
        notes: combinedNotes,
        createdAt: insertedData.created_at || new Date().toISOString(),
      })
      .catch((e) => console.warn('[Notification] Dispatch error:', e));

    return NextResponse.json({
      success: true,
      reservation_id: insertedData.reservation_id,
      reservation_number: resNumber,
      deposit_amount: expectedDeposit,
      message: `تم إرسال طلب الحجز بنجاح برقم #${resNumber}. تم تسجيل إيصال العربون بمبلغ ${expectedDeposit} ج.م وسيتم خصمه من فاتورتك عند الحضور.`,
    });
  } catch (err: any) {
    console.error('[Reservations API Fatal Error]', err);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء معالجة الحجز' },
      { status: 500 }
    );
  }
}
