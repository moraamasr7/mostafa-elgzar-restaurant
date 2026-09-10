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

    // 3. Validation: Guest Count
    const guests = parseInt(String(guest_count), 10);
    if (isNaN(guests) || guests < 1 || guests > 30) {
      return NextResponse.json(
        { error: 'عدد الأفراد يجب أن يكون بين شخص واحد و 30 شخصاً' },
        { status: 400 }
      );
    }

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

    // 6. Authoritative Reservation Creation via RPC
    const { data: rpcData, error: dbErr } = await supabase.rpc('create_reservation_secure', {
      p_customer_name: cleanName,
      p_customer_phone: cleanPhone,
      p_reservation_date: reservation_date,
      p_reservation_time: `${requestedSlot.time}:00`,
      p_guest_count: guests,
      p_notes: notes ? notes.trim().slice(0, 300) : null,
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

    // 7. Decoupled Non-blocking Notification Dispatch
    notificationService
      .dispatch({
        type: 'reservation.created',
        reservationNumber: resNumber,
        customerName: cleanName,
        customerPhone: cleanPhone,
        reservationDate: reservation_date,
        reservationTime: requestedSlot.displayTime,
        guestCount: guests,
        notes: notes ? notes.trim() : null,
        createdAt: insertedData.created_at || new Date().toISOString(),
      })
      .catch((e) => console.warn('[Notification] Dispatch error:', e));

    return NextResponse.json({
      success: true,
      reservation_id: insertedData.reservation_id,
      reservation_number: resNumber,
      message: 'تم إرسال طلب الحجز بنجاح. سيتم مراجعة وتأكيد الحجز من إدارة المطعم هاتفياً قبل الموعد.',
    });
  } catch (err: any) {
    console.error('[Reservations API Fatal Error]', err);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء معالجة الحجز' },
      { status: 500 }
    );
  }
}
