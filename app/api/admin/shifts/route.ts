import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { DailyShift, OpenShiftRequest, ActiveShiftApiResponse } from '@/types/shifts';

/**
 * GET /api/admin/shifts
 * Returns the currently active open daily shift.
 * If multiple active shifts are found (integrity anomaly), returns code MULTIPLE_ACTIVE_SHIFTS_ANOMALY.
 */
export async function GET(): Promise<NextResponse<ActiveShiftApiResponse>> {
  try {
    const { data, error } = await supabase
      .from('daily_shifts')
      .select('*')
      .eq('status', 'open')
      .order('opened_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, shift: null, error: 'تعذر جلب بيانات الوردية من الخادم', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    const openShifts = (data || []) as DailyShift[];

    if (openShifts.length > 1) {
      // Contract / Data Integrity Alert: Multiple open shifts detected concurrently
      return NextResponse.json(
        {
          success: false,
          shift: null,
          error: `تنبيه أمني: تم اكتشاف ${openShifts.length} ورديات مفتوحة في نفس الوقت. يرجى مراجعة إدارة العمليات.`,
          code: 'MULTIPLE_ACTIVE_SHIFTS_ANOMALY',
        },
        { status: 409 }
      );
    }

    if (openShifts.length === 1) {
      return NextResponse.json({ success: true, shift: openShifts[0] });
    }

    // No open shift
    return NextResponse.json({ success: true, shift: null });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, shift: null, error: err?.message || 'حدث خطأ غير متوقع', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shifts
 * Opens a new daily shift.
 * Validates inputs and enforces active shift guard.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: OpenShiftRequest = await request.json();
    const { opened_by, initial_cash } = body;

    // 1. Input Validation
    if (!opened_by || typeof opened_by !== 'string' || opened_by.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسم مسؤول فتح الوردية (حرفين على الأقل)', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const parsedCash = Number(initial_cash);
    if (isNaN(parsedCash) || !isFinite(parsedCash) || parsedCash < 0) {
      return NextResponse.json(
        { success: false, error: 'عهدة البداية يجب أن تكون رقماً موجباً أو صفراً', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // 2. Pre-check: Ensure no open shift exists
    const { data: existingOpen, error: checkError } = await supabase
      .from('daily_shifts')
      .select('id, shift_number, opened_by, opened_at')
      .eq('status', 'open');

    if (checkError) {
      return NextResponse.json(
        { success: false, error: 'فشل التحقق من حالة الورديات الحالية', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    if (existingOpen && existingOpen.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `توجد وردية مفتوحة بالفعل (وردية رقم #${existingOpen[0].shift_number} بواسطة ${existingOpen[0].opened_by}). يجب إغلاقها أولاً.`,
          code: 'ACTIVE_SHIFT_EXISTS',
        },
        { status: 409 }
      );
    }

    // 3. Insert new shift
    const { data: newShift, error: insertError } = await supabase
      .from('daily_shifts')
      .insert({
        opened_by: opened_by.trim(),
        initial_cash: parsedCash,
        status: 'open',
        opened_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !newShift) {
      return NextResponse.json(
        { success: false, error: insertError?.message || 'تعذر تسجيل فتح الوردية', code: 'INSERT_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, shift: newShift as DailyShift },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'حدث خطأ أثناء معالجة الطلب', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
