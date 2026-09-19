import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Rate Limiting Map: IP/Phone -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 6;      // Max 6 requests per minute

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(identifier) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(identifier, validTimestamps);

  // Periodic pruning if map gets large
  if (rateLimitMap.size > 1000) {
    rateLimitMap.forEach((times, k) => {
      const active = times.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) {
        rateLimitMap.delete(k);
      } else {
        rateLimitMap.set(k, active);
      }
    });
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extract client IP / identifier for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'anonymous-client';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'تجاوزت الحد المسموح من الاستعلامات. يرجى الانتظار دقيقة والمحاولة مجدداً.' },
        { status: 429 }
      );
    }

    // 2. Parse and validate JSON request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'بيانات الطلب غير صالحة، يرجى التأكد من إرسال JSON سليم.' },
        { status: 400 }
      );
    }

    const { reservation_number, customer_phone } = body || {};

    // 3. Validation: Reservation Number
    const parsedResNum = parseInt(String(reservation_number), 10);
    if (isNaN(parsedResNum) || parsedResNum <= 0) {
      return NextResponse.json(
        { error: 'رقم الحجز غير صالح، يجب أن يكون رقماً صحيحاً.' },
        { status: 400 }
      );
    }

    // 4. Validation: Egyptian Mobile Phone
    const cleanPhone = (customer_phone || '').trim().replace(/\s+/g, '');
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 01).' },
        { status: 400 }
      );
    }

    // Rate limit per phone as well to prevent brute force targeting specific numbers
    if (isRateLimited(`phone:${cleanPhone}`)) {
      return NextResponse.json(
        { error: 'تجاوزت الحد المسموح من الاستعلامات لهذا الرقم. يرجى الانتظار دقيقة والمحاولة مجدداً.' },
        { status: 429 }
      );
    }

    // 5. Authoritative RPC query to Supabase (SECURITY DEFINER with strict search_path)
    const { data, error } = await supabase.rpc('get_customer_reservation_status', {
      p_reservation_number: parsedResNum,
      p_customer_phone: cleanPhone,
    });

    if (error) {
      console.error('[Reservation Status API DB Error]', error);
      return NextResponse.json(
        { error: 'تعذر جلب حالة الحجز حالياً، يرجى المحاولة لاحقاً.' },
        { status: 500 }
      );
    }

    // 6. Ownership & Existence Verification
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Uniform generic error for both non-existent numbers and phone mismatches (Anti-enumeration)
      return NextResponse.json(
        { error: 'لم يتم العثور على حجز يطابق البيانات المدخلة.' },
        { status: 404 }
      );
    }

    const record = data[0];

    // Format reservation_time if it contains seconds (e.g. "14:00:00" -> "14:00")
    let displayTime = record.reservation_time;
    if (typeof displayTime === 'string' && displayTime.length >= 5) {
      displayTime = displayTime.slice(0, 5);
    }

    // 7. Return strict minimal response (Minimal Non-Sensitive Reservation Payload)
    return NextResponse.json({
      success: true,
      reservation: {
        reservation_number: Number(record.reservation_number),
        status: record.status,
        reservation_date: record.reservation_date,
        reservation_time: displayTime,
        guest_count: Number(record.guest_count),
        created_at: record.created_at,
        updated_at: record.updated_at,
      },
    });
  } catch (err: any) {
    console.error('[Reservation Status API Fatal Error]', err);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء الاستعلام عن الحجز.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'طريقة الطلب غير مدعومة. يجب استخدام POST مع رقم الحجز ورقم الهاتف.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
