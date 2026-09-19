import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import {
  CloseShiftRequest,
  CloseShiftApiResponse,
  DailyShift,
  ShiftReconciliationResult,
} from '@/types/shifts';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/admin/shifts/close
 * Closes an active daily shift and performs authoritative server-side financial reconciliation.
 * React / Frontend is strictly prohibited from computing financial reconciliation.
 */
export async function POST(request: NextRequest): Promise<NextResponse<CloseShiftApiResponse>> {
  try {
    const body: CloseShiftRequest = await request.json();
    const { shift_id, closed_by, final_cash, notes } = body;

    // 1. Validation
    if (!shift_id || !UUID_REGEX.test(shift_id)) {
      return NextResponse.json(
        { success: false, error: 'معرف الوردية غير صحيح', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (!closed_by || typeof closed_by !== 'string' || closed_by.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسم مسؤول إغلاق الوردية (حرفين على الأقل)', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const parsedFinalCash = Number(final_cash);
    if (isNaN(parsedFinalCash) || !isFinite(parsedFinalCash) || parsedFinalCash < 0) {
      return NextResponse.json(
        { success: false, error: 'المبلغ الفعلي في الخزينة يجب أن يكون رقماً موجباً أو صفراً', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // 2. Fetch target shift
    const { data: shiftData, error: shiftErr } = await supabase
      .from('daily_shifts')
      .select('*')
      .eq('id', shift_id)
      .single();

    if (shiftErr || !shiftData) {
      return NextResponse.json(
        { success: false, error: 'الوردية المطلوبة غير موجودة', code: 'SHIFT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const shift = shiftData as DailyShift;

    if (shift.status === 'closed') {
      return NextResponse.json(
        { success: false, error: 'هذه الوردية مغلقة بالفعل مسبقاً', code: 'ALREADY_CLOSED' },
        { status: 400 }
      );
    }

    // 3. Server-side Query: Cash sales during shift lifetime
    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select('id, total_amount, payment_method, status, created_at')
      .gte('created_at', shift.opened_at)
      .neq('status', 'cancelled')
      .neq('status', 'failed')
      .eq('payment_method', 'cash');

    if (ordersErr) {
      return NextResponse.json(
        { success: false, error: 'فشل احتساب إجمالي مبيعات الوردية من الخادم', code: 'FINANCIAL_RECONCILIATION_ERROR' },
        { status: 500 }
      );
    }

    const cashOrders = ordersData || [];
    const cashSalesTotal = cashOrders.reduce((sum, ord) => sum + Number(ord.total_amount || 0), 0);

    // 4. Server-side Query: Shift Expenses
    const { data: expData, error: expErr } = await supabase
      .from('shift_expenses')
      .select('id, amount')
      .eq('shift_id', shift_id);

    if (expErr) {
      return NextResponse.json(
        { success: false, error: 'فشل احتساب مصروفات الوردية من الخادم', code: 'FINANCIAL_RECONCILIATION_ERROR' },
        { status: 500 }
      );
    }

    const expensesList = expData || [];
    const expensesTotal = expensesList.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    // 5. Authoritative Server Financial Reconciliation
    const initialCash = Number(shift.initial_cash || 0);
    const systemExpectedCash = Number((initialCash + cashSalesTotal - expensesTotal).toFixed(2));
    const discrepancy = Number((parsedFinalCash - systemExpectedCash).toFixed(2));
    const closedAtIso = new Date().toISOString();

    // 6. Update Shift Record
    const { data: updatedShift, error: updateErr } = await supabase
      .from('daily_shifts')
      .update({
        status: 'closed',
        closed_by: closed_by.trim(),
        closed_at: closedAtIso,
        final_cash: parsedFinalCash,
        system_expected_cash: systemExpectedCash,
        discrepancy: discrepancy,
        notes: notes ? notes.trim() : shift.notes,
      })
      .eq('id', shift_id)
      .select()
      .single();

    if (updateErr || !updatedShift) {
      return NextResponse.json(
        { success: false, error: updateErr?.message || 'تعذر إغلاق الوردية في قاعدة البيانات', code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    const reconciliation: ShiftReconciliationResult = {
      shift_id: shift.id,
      shift_number: shift.shift_number,
      opened_by: shift.opened_by,
      closed_by: closed_by.trim(),
      opened_at: shift.opened_at,
      closed_at: closedAtIso,
      initial_cash: initialCash,
      cash_sales_total: cashSalesTotal,
      cash_orders_count: cashOrders.length,
      expenses_total: expensesTotal,
      expenses_count: expensesList.length,
      system_expected_cash: systemExpectedCash,
      final_cash: parsedFinalCash,
      discrepancy: discrepancy,
    };

    return NextResponse.json({
      success: true,
      shift: updatedShift as DailyShift,
      reconciliation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'حدث خطأ غير متوقع أثناء إغلاق الوردية', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
