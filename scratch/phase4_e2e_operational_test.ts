import { NextRequest } from 'next/server';
import { POST as createShift } from '../app/api/admin/shifts/route';
import { POST as closeShift } from '../app/api/admin/shifts/close/route';
import { POST as createCustomerOrder } from '../app/api/orders/route';
import { isRestaurantOpen } from '../lib/schedule';

console.log('=== PHASE 4 — MODULE 5: E2E OPERATIONAL CERTIFICATION SUITE ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    if (detail) console.log(`       Evidence: ${detail}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (detail) console.error(`       Detail: ${detail}`);
    failCount++;
  }
}

async function runE2ESuite() {
  // E2E-01: Shift Open Request Payload Validation
  try {
    const invalidOpenReq = new NextRequest('http://localhost:3000/api/admin/shifts', {
      method: 'POST',
      body: JSON.stringify({ opened_by: 'مصطفى الجزار', initial_cash: -100 }), // Negative cash with valid opened_by
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await createShift(invalidOpenReq);
    const json = await res.json();
    assert(
      res.status === 400 && (json.error.includes('عهدة البداية') || json.error.includes('بداية الوردية')),
      'E2E-01: Shift Open rejects negative initial cash',
      `Status ${res.status}: ${json.error}`
    );
  } catch (e: any) {
    assert(false, 'E2E-01: Shift Open rejects negative initial cash', e.message);
  }

  // E2E-02: Shift Close Request Payload Validation
  try {
    const invalidCloseReq = new NextRequest('http://localhost:3000/api/admin/shifts/close', {
      method: 'POST',
      body: JSON.stringify({
        shift_id: '11111111-1111-1111-1111-111111111111',
        closed_by: 'مصطفى الجزار',
        final_cash: -50,
      }), // Negative final cash with valid UUID & closed_by
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await closeShift(invalidCloseReq);
    const json = await res.json();
    assert(
      res.status === 400 && json.error.includes('المبلغ الفعلي في الخزينة يجب أن يكون رقماً موجباً أو صفراً'),
      'E2E-02: Shift Close rejects negative final cash',
      `Status ${res.status}: ${json.error}`
    );
  } catch (e: any) {
    assert(false, 'E2E-02: Shift Close rejects negative final cash', e.message);
  }

  // E2E-03: Order Validation (Delivery missing address)
  try {
    const invalidOrderReq = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'علي مصطفى',
        customer_phone: '01011112222',
        order_type: 'delivery',
        delivery_address: '', // empty
        items: [{ variant_id: 'var-1', quantity: 1 }],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await createCustomerOrder(invalidOrderReq);
    const json = await res.json();
    assert(
      res.status === 400 && json.error.includes('عنوان التوصيل مطلوب'),
      'E2E-03: Delivery order requires valid non-empty address',
      `Status ${res.status}: ${json.error}`
    );
  } catch (e: any) {
    assert(false, 'E2E-03: Delivery order requires valid non-empty address', e.message);
  }

  // E2E-04: Order Validation (Invalid order_type)
  try {
    const invalidTypeReq = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'علي مصطفى',
        customer_phone: '01011112222',
        order_type: 'invalid_type',
        items: [{ variant_id: 'var-1', quantity: 1 }],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await createCustomerOrder(invalidTypeReq);
    const json = await res.json();
    assert(
      res.status === 400 && (json.error.includes('نوع استلام الطلب غير صالح') || json.error.includes('نوع الطلب')),
      'E2E-04: Order API rejects unknown order_type',
      `Status ${res.status}: ${json.error}`
    );
  } catch (e: any) {
    assert(false, 'E2E-04: Order API rejects unknown order_type', e.message);
  }

  // E2E-05: Restaurant Schedule Context Check
  try {
    const sched = await isRestaurantOpen();
    assert(
      typeof sched.isOpen === 'boolean' && sched.timezone === 'Africa/Cairo',
      'E2E-05: Schedule check uses timezone Africa/Cairo',
      `isOpen: ${sched.isOpen}, timezone: ${sched.timezone}`
    );
  } catch (e: any) {
    assert(false, 'E2E-05: Schedule check uses timezone Africa/Cairo', e.message);
  }

  console.log(`\n=== MODULE 5 E2E SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
  if (failCount > 0) process.exit(1);
}

runE2ESuite();
